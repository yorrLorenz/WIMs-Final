package com.wims.controller;

import com.wims.model.Warehouse;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Controller
public class WarehouseController {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @GetMapping("/create-warehouse")
    public String showCreateForm(Model model) {
        model.addAttribute("warehouse", new Warehouse());
        return "create-warehouse"; // maps to create-warehouse.html
    }

    @PostMapping("/create-warehouse")
    public String createWarehouse(@ModelAttribute Warehouse warehouse) {
        Optional<Warehouse> existing = warehouseRepository.findByName(warehouse.getName().trim());

        if (existing.isEmpty()) {
            warehouse.setName(warehouse.getName().trim());
            warehouse.setCode(generateNextWarehouseCode()); // assign unique 2-letter code
            warehouseRepository.save(warehouse);
        }

        return "redirect:/location-selection";
    }

    private String generateNextWarehouseCode() {
        List<Warehouse> all = warehouseRepository.findAll();
        Set<String> existingCodes = all.stream()
            .map(Warehouse::getCode)
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
