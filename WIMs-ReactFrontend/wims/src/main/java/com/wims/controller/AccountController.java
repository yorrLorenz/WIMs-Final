package com.wims.controller;

import com.wims.dto.AccountForm;
import com.wims.model.User;
import com.wims.repository.UserRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/accounts")
public class AccountController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/create")
    public String showCreateAccountForm(Model model) {
        model.addAttribute("accountForm", new AccountForm()); // use "accountForm" for binding
        model.addAttribute("warehouses", warehouseRepository.findAll()); // dynamic dropdown
        return "create-account";
    }

    @PostMapping("/create")
    public String handleAccountCreation(@ModelAttribute("accountForm") AccountForm account) {
        User newUser = new User();
        newUser.setUsername(account.getUsername());
        newUser.setPassword(passwordEncoder.encode(account.getPassword()));
        newUser.setRole(account.getRole());
        newUser.setWarehouse(account.getWarehouse());

        userRepository.save(newUser);

        return "redirect:/location-selection";
    }
}
