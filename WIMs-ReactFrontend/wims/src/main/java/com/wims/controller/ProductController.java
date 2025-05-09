package com.wims.controller;

import com.wims.model.Log;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

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
    private LogRepository logRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @PostMapping("/add")
    public String addProduct(@RequestBody ProductRequest request) {
        Optional<Warehouse> optionalWarehouse = warehouseRepository.findByName(request.getWarehouse());
        if (optionalWarehouse.isEmpty()) {
            throw new RuntimeException("Warehouse not found");
        }

        Log log = new Log();
        log.setUsername(request.getUsername());
        log.setAction(request.getAction());
        log.setItem(request.getItemName());
        log.setWarehouse(request.getWarehouse());
        log.setLocation(request.getLocation());
        log.setGroupId(request.getGroupId());
        log.setDateTime(LocalDateTime.now());

        logRepository.save(log);
        return "Product logged successfully";
    }

    public static class ProductRequest {
        private String username;
        private String action;
        private String itemName;
        private String warehouse;
        private String location;
        private String groupId;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

        public String getWarehouse() { return warehouse; }
        public void setWarehouse(String warehouse) { this.warehouse = warehouse; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
    }
}
