package com.wims.controller;

import com.wims.model.User;
import com.wims.repository.UserRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Controller
public class RoutingController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @GetMapping("/route")
    public String routeAfterLogin(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return "redirect:/login?error";
        }

        if ("ADMIN".equals(user.getRole())) {
            return "redirect:/location-selection";
        } else if ("CLERK".equals(user.getRole())) {
            // FIXED: Dynamically redirect to the warehouse assigned to the clerk
            String warehouseName = URLEncoder.encode(user.getWarehouse(), StandardCharsets.UTF_8);
            return "redirect:/warehouse/" + warehouseName;
        }

        return "redirect:/login?error";
    }

    @GetMapping("/location-selection")
    public String locationSelectionPage(Model model) {
        List<com.wims.model.Warehouse> warehouses = warehouseRepository.findAll();
        model.addAttribute("warehouses", warehouses);
        return "location-selection";
    }
}
