package com.wims.controller;

import com.wims.dto.DashboardLogDTO;
import com.wims.model.Log;
import com.wims.model.Product;
import com.wims.model.User;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.ProductRepository;
import com.wims.repository.UserRepository;
import com.wims.repository.WarehouseRepository;
import com.wims.service.LogBroadcastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private LogRepository logRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private LogBroadcastService logBroadcastService;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody ProductRequest request) {
        Optional<Warehouse> warehouseOpt = warehouseRepository.findByName(request.getWarehouse());
        if (warehouseOpt.isEmpty()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Warehouse not found");

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");

        User user = userOpt.get();
        Warehouse warehouse = warehouseOpt.get();

        Log log = new Log();
        log.setUserId(user.getId()); // ✅ store user ID
        log.setUsername(user.getUsername()); // for display
        log.setAction(request.getAction());
        log.setWarehouse(request.getWarehouse());
        log.setDateTime(LocalDateTime.now());

        if ("Restocked".equalsIgnoreCase(request.getAction())) {
            String groupId = generateCustomGroupId(warehouse);
            log.setItem(request.getItem());
            log.setGroupId(groupId);
            log.setLocation(request.getLocation());
            log.setUnits(request.getUnits());

            Product product = new Product();
            product.setItem(request.getItem());
            product.setGroupId(groupId);
            product.setWarehouse(request.getWarehouse());
            product.setCurrentLocation(request.getLocation());
            product.setUnits(request.getUnits());
            product.setActive(true);
            productRepository.save(product);

        } else if ("Removed".equalsIgnoreCase(request.getAction())) {
            log.setGroupId(request.getGroupId());
            Optional<Product> productOpt = productRepository.findByGroupId(request.getGroupId());
            if (productOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

            Product product = productOpt.get();
            if (!product.isActive()) return ResponseEntity.badRequest().body("Product not in warehouse");
            if (!product.getWarehouse().equals(request.getWarehouse()))
                return ResponseEntity.badRequest().body("Wrong warehouse");

            int currentUnits = product.getUnits();
            int unitsToRemove = request.getUnits();
            if (unitsToRemove <= 0 || unitsToRemove > currentUnits)
                return ResponseEntity.badRequest().body("Invalid number of units");

            log.setItem(product.getItem());
            log.setLocation(product.getCurrentLocation());
            log.setUnits(unitsToRemove);
            log.setRemainingUnits(currentUnits - unitsToRemove);

            if (unitsToRemove == currentUnits) {
                product.setActive(false);
                product.setUnits(0);
            } else {
                product.setUnits(currentUnits - unitsToRemove);
            }

            productRepository.save(product);

        } else if ("Move".equalsIgnoreCase(request.getAction())) {
            log.setGroupId(request.getGroupId());

            Optional<Product> productOpt = productRepository.findByGroupId(request.getGroupId());
            if (productOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");

            Product original = productOpt.get();
            if (!original.isActive()) return ResponseEntity.badRequest().body("Inactive product");
            if (!original.getWarehouse().equals(request.getWarehouse()))
                return ResponseEntity.badRequest().body("Wrong warehouse");

            int moveUnits = request.getUnits();
            if (moveUnits <= 0 || moveUnits > original.getUnits())
                return ResponseEntity.badRequest().body("Invalid units to move");

            String oldLocation = original.getCurrentLocation();
            String newLocation = request.getLocation();
            log.setPreviousLocation(oldLocation);
            log.setLocation(newLocation);
            log.setItem(original.getItem());
            log.setUnits(moveUnits);

            if (moveUnits == original.getUnits()) {
                original.setCurrentLocation(newLocation);
                productRepository.save(original);
            } else {
                original.setUnits(original.getUnits() - moveUnits);
                productRepository.save(original);

                String newGroupId = generateCustomGroupId(warehouse);
                Product newProduct = new Product();
                newProduct.setItem(original.getItem());
                newProduct.setGroupId(newGroupId);
                newProduct.setWarehouse(original.getWarehouse());
                newProduct.setCurrentLocation(newLocation);
                newProduct.setUnits(moveUnits);
                newProduct.setActive(true);
                productRepository.save(newProduct);

                log.setItem(original.getItem() + " (Moved " + moveUnits + " units from " + oldLocation + " → " + newLocation + ", new Group ID: " + newGroupId + ")");
                log.setGroupId(newGroupId);

                Log originalLog = new Log();
                originalLog.setUserId(user.getId());
                originalLog.setUsername(user.getUsername());
                originalLog.setAction("Move");
                originalLog.setWarehouse(original.getWarehouse());
                originalLog.setGroupId(request.getGroupId());
                originalLog.setItem(original.getItem());
                originalLog.setLocation(oldLocation);
                originalLog.setUnits(original.getUnits());
                originalLog.setDateTime(LocalDateTime.now());
                originalLog.setPreviousLocation(oldLocation);
                logRepository.save(originalLog);

                DashboardLogDTO originalDto = new DashboardLogDTO(
                    originalLog.getId(),
                    originalLog.getDateTime(),
                    originalLog.getUsername(),
                    originalLog.getAction(),
                    originalLog.getItem(),
                    originalLog.getWarehouse(),
                    originalLog.getLocation(),
                    originalLog.getGroupId(),
                    originalLog.getUnits(),
                    originalLog.getRemainingUnits(),
                    originalLog.getPreviousLocation()
                );
                logBroadcastService.broadcastLogUpdate(originalDto);
            }
        }

        logRepository.save(log);

        DashboardLogDTO dto = new DashboardLogDTO(
            log.getId(),
            log.getDateTime(),
            log.getUsername(),
            log.getAction(),
            log.getItem(),
            log.getWarehouse(),
            log.getLocation(),
            log.getGroupId(),
            log.getUnits(),
            log.getRemainingUnits(),
            log.getPreviousLocation()
        );

        logBroadcastService.broadcastLogUpdate(dto);

        return ResponseEntity.ok("Product logged");
    }

    private String generateCustomGroupId(Warehouse warehouse) {
        String prefix = warehouse.getCode() + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMdd"));
        long count = logRepository.countByGroupIdStartingWith(prefix) + 1;
        return String.format("%s-%04d", prefix, count);
    }

    public static class ProductRequest {
        private String username, action, item, warehouse, location, groupId;
        private int units;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }

        public String getItem() { return item; }
        public void setItem(String item) { this.item = item; }

        public String getWarehouse() { return warehouse; }
        public void setWarehouse(String warehouse) { this.warehouse = warehouse; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public int getUnits() { return units; }
        public void setUnits(int units) { this.units = units; }
    }
}
