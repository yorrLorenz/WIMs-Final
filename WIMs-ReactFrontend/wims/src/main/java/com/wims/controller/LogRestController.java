package com.wims.controller;

import com.wims.model.Log;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.net.URLDecoder;
import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/api/logs")
public class LogRestController {

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @PostMapping("/warehouse/{warehouseId}/add")
    public ResponseEntity<String> addLog(@PathVariable String warehouseId, @RequestBody Log log) {
        String decodedWarehouseName = URLDecoder.decode(warehouseId, StandardCharsets.UTF_8);
        Optional<Warehouse> optionalWarehouse = warehouseRepository.findByName(decodedWarehouseName);

        if (optionalWarehouse.isEmpty()) {
            return ResponseEntity.badRequest().body("Warehouse not found");
        }

        log.setWarehouse(decodedWarehouseName);
        log.setDateTime(Instant.now()); 
        logRepository.save(log);

        return ResponseEntity.ok("Log saved");
    }
}
