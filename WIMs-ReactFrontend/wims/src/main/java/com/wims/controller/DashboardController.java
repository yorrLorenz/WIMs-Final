package com.wims.controller;

import com.wims.dto.LogForm;
import com.wims.model.Log;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class DashboardController {

    private final WarehouseRepository warehouseRepository;
    private final LogRepository logRepository;

    @Autowired
    public DashboardController(WarehouseRepository warehouseRepository, LogRepository logRepository) {
        this.warehouseRepository = warehouseRepository;
        this.logRepository = logRepository;
    }

    @GetMapping("/warehouse/{warehouseId}")
    public String warehouseDashboard(@PathVariable String warehouseId, Model model) {
        Optional<Warehouse> warehouseOpt = warehouseRepository.findByName(URLDecoder.decode(warehouseId, StandardCharsets.UTF_8));
        if (warehouseOpt.isEmpty()) return "redirect:/location-selection";

        Warehouse warehouse = warehouseOpt.get();
        List<Log> logs = logRepository.findByWarehouseOrderByDateTimeDesc(warehouse.getName());

        for (Log log : logs) {
            if (log.getGroupId() != null) {
                log.setRelatedLogs(logRepository.findByGroupIdOrderByDateTimeDesc(log.getGroupId()));
            }
        }

        model.addAttribute("warehouse", warehouse);
        model.addAttribute("logs", logs);
        return "dashboard";
    }

    @GetMapping("/warehouse/{warehouseId}/products/add")
    public String showAddProductForm(@PathVariable String warehouseId, Model model, Principal principal) {
        String decodedName = URLDecoder.decode(warehouseId, StandardCharsets.UTF_8);
        Optional<Warehouse> optionalWarehouse = warehouseRepository.findByName(decodedName);

        if (optionalWarehouse.isEmpty()) {
            return "redirect:/location-selection";
        }

        Warehouse warehouse = optionalWarehouse.get();
        model.addAttribute("warehouse", warehouse);
        model.addAttribute("logForm", new LogForm());

        return "add-product";
    }

    @PostMapping("/warehouse/{warehouseId}/products/add")
    public String handleAddProduct(@PathVariable String warehouseId,
                                   @ModelAttribute LogForm logForm,
                                   Principal principal) {
        String decodedName = URLDecoder.decode(warehouseId, StandardCharsets.UTF_8);
        Optional<Warehouse> optionalWarehouse = warehouseRepository.findByName(decodedName);

        if (optionalWarehouse.isEmpty()) {
            return "redirect:/location-selection";
        }

        Warehouse warehouse = optionalWarehouse.get();

        Log log = new Log();
        log.setDateTime(Instant.now());  // ✅ Store accurate UTC time
        log.setUsername(principal.getName());
        log.setAction(logForm.getAction());
        log.setItem(logForm.getItem());
        log.setWarehouse(warehouse.getName());
        log.setLocation(logForm.getWarehouseLocation());
        log.setGroupId(logForm.getGroupId());

        logRepository.save(log);

        return "redirect:/warehouse/" + URLEncoder.encode(decodedName, StandardCharsets.UTF_8);
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard(Model model) {
        List<Log> allLogs = logRepository.findAllByOrderByDateTimeDesc();
        model.addAttribute("logs", allLogs);
        return "admin-dashboard";
    }
}
