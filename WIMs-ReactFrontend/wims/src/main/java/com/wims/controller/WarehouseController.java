package com.wims.controller;

import com.wims.model.Warehouse;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class WarehouseController {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @GetMapping("/create-warehouse")
    public String showCreateForm(Model model) {
        model.addAttribute("warehouse", new Warehouse());
        return "create-warehouse"; // this is create-warehouse.html in templates
    }

    @PostMapping("/create-warehouse")
    public String createWarehouse(@ModelAttribute Warehouse warehouse) {
        if (warehouseRepository.findByName(warehouse.getName()).isEmpty()) {
            warehouse.setName(warehouse.getName().trim());
            warehouseRepository.save(warehouse);
        }
        
        return "redirect:/location-selection";
    }
}
