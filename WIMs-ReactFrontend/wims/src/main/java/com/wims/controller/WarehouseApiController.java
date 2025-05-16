package com.wims.controller;

import com.wims.model.User;
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
import com.wims.repository.UserRepository;




import java.util.Set;

import java.util.Objects;
import java.util.Optional;


@RestController
@RequestMapping("/api/warehouses")
public class WarehouseApiController {
    
@Autowired
private UserRepository userRepository;

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
    warehouse.setCode(generateNextWarehouseCode()); 
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
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteWarehouse(@PathVariable Long id) {
    Optional<Warehouse> warehouseOpt = warehouseRepository.findById(id);
    if (warehouseOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Warehouse not found");
    }

    Warehouse warehouse = warehouseOpt.get();
    List<User> assignedUsers = userRepository.findByWarehouse(warehouse.getName());
    if (!assignedUsers.isEmpty()) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Cannot delete warehouse assigned to users.");
    }

    warehouseRepository.deleteById(id);
    return ResponseEntity.ok("Warehouse deleted successfully");
}




}

