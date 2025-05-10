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
import java.util.stream.Collectors;
import java.util.List;




import java.util.Set;

import java.util.Objects;


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

    if (warehouse.getLatitude() == null || warehouse.getLongitude() == null) {
        return ResponseEntity.badRequest().body("Latitude and Longitude are required");
    }

    warehouse.setName(warehouse.getName().trim());
    warehouse.setCode(generateNextWarehouseCode()); // ✅ FIX: assign 2-letter code
    warehouseRepository.save(warehouse);

    return ResponseEntity.ok("Warehouse created");
}

private String generateNextWarehouseCode() {
    List<Warehouse> all = warehouseRepository.findAll();
    Set<String> existingCodes = all.stream()
        .map(Warehouse::getCode)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());

    for (char c1 = 'A'; c1 <= 'Z'; c1++) {
        for (char c2 = 'A'; c2 <= 'Z'; c2++) {
            String code = "" + c1 + c2;
            if (!existingCodes.contains(code)) {
                return code;
            }
        }
    }

    throw new IllegalStateException("Exhausted warehouse code space (AA-ZZ)");
}


}

