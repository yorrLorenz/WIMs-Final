package com.wims.controller;


import com.wims.model.User;

import com.wims.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.wims.dto.AccountForm;

import com.wims.model.Warehouse;

import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;



@RestController
@RequestMapping("/api/accounts")
public class AccountApiRestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create")
    public ResponseEntity<String> createAccount(@RequestBody AccountForm accountForm) {
        if (userRepository.findByUsername(accountForm.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        User newUser = new User();
        newUser.setUsername(accountForm.getUsername());
        newUser.setPassword(passwordEncoder.encode(accountForm.getPassword()));
        newUser.setRole(accountForm.getRole());
        newUser.setWarehouse(accountForm.getRole().equals("CLERK") ? accountForm.getWarehouse() : "Global");
        newUser.setImageUrl(""); // Set default for now

        userRepository.save(newUser);

        return ResponseEntity.ok("Account created successfully");
    }

    @GetMapping("/warehouses")
    public List<Warehouse> getWarehouses() {
        return warehouseRepository.findAll();
    }
}
