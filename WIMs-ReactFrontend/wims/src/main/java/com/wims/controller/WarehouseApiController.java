package com.wims.controller;

import com.wims.model.Warehouse;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.wims.model.Warehouse;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "https://wims-rosy.vercel.app"
    },
    allowCredentials = "true"
)
public class WarehouseApiController {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @GetMapping
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createWarehouse(@RequestBody Warehouse warehouse) {
        if (warehouse.getName() == null || warehouse.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Warehouse name cannot be empty");
        }

        if (warehouseRepository.findByName(warehouse.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Warehouse already exists");
        }

        warehouse.setName(warehouse.getName().trim());
        warehouseRepository.save(warehouse);
        return ResponseEntity.ok("Warehouse created");
    }
}

