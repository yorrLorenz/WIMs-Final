package com.wims.controller;

import com.wims.model.Log;
import com.wims.model.Product;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.ProductRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "https://wims-rosy.vercel.app"
    },
    allowCredentials = "true"
)
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @PostMapping("/add")
    public String addProduct(@RequestBody ProductRequest request) {
        Optional<Warehouse> warehouseOpt = warehouseRepository.findByName(request.getWarehouse());
        if (warehouseOpt.isEmpty()) throw new RuntimeException("Warehouse not found");

        Warehouse warehouse = warehouseOpt.get();

        Log log = new Log();
        log.setUsername(request.getUsername());
        log.setAction(request.getAction());
        log.setWarehouse(request.getWarehouse());
        log.setLocation(request.getLocation());

        if ("Restocked".equalsIgnoreCase(request.getAction())) {
            String groupId = generateCustomGroupId(warehouse);
            log.setItem(request.getItem());
            log.setGroupId(groupId);

            // Create Product state
            Product product = new Product();
            product.setItem(request.getItem());
            product.setGroupId(groupId);
            product.setWarehouse(request.getWarehouse());
            product.setCurrentLocation(request.getLocation());
            productRepository.save(product);

        } else if ("Removed".equalsIgnoreCase(request.getAction())) {
            log.setItem(request.getItem());
            log.setGroupId(request.getGroupId());

            // Use last known product location
            productRepository.findByGroupId(request.getGroupId()).ifPresent(product -> {
                log.setLocation(product.getCurrentLocation());
                product.setActive(false);
                productRepository.save(product);
            });

        } else if ("Move".equalsIgnoreCase(request.getAction())) {
            List<Log> previousLogs = logRepository.findByGroupId(request.getGroupId());
            if (previousLogs.isEmpty()) {
                throw new RuntimeException("Group ID not found");
            }

            log.setItem(previousLogs.get(0).getItem());
            log.setGroupId(request.getGroupId());

            productRepository.findByGroupId(request.getGroupId())
                .ifPresent(product -> {
                    product.setCurrentLocation(request.getLocation());
                    productRepository.save(product);
                });
        }

        log.setDateTime(LocalDateTime.now());
        logRepository.save(log);
        return "Product logged successfully";
    }

    private String generateCustomGroupId(Warehouse warehouse) {
        String code = warehouse.getCode(); // e.g., AA
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMdd"));

        // Count logs for today starting with this code+date
        String prefix = code + "-" + date;
        long count = logRepository.countByGroupIdStartingWith(prefix) + 1;

        return String.format("%s-%04d", prefix, count);
    }

    public static class ProductRequest {
        private String username;
        private String action;
        private String item;
        private String warehouse;
        private String location;
        private String groupId;

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
    }
}
