package com.wims.controller;

import com.wims.model.User;
import com.wims.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import com.wims.dto.AccountForm;
import com.wims.model.Warehouse;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/accounts")
public class AccountApiRestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createAccount(
        @RequestPart("account") AccountForm form,
        @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        if (userRepository.findByUsername(form.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        User newUser = new User();
        newUser.setUsername(form.getUsername());
        newUser.setPassword(passwordEncoder.encode(form.getPassword()));
        newUser.setRole(form.getRole());
        newUser.setWarehouse(form.getRole().equals("CLERK") ? form.getWarehouse() : "Global");

        if (imageFile != null && !imageFile.isEmpty()) {
            // ✅ Check MIME type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            try {
                String fileName = UUID.randomUUID() + "-" + imageFile.getOriginalFilename();
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

                Path filePath = uploadPath.resolve(fileName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                newUser.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed");
            }
        } else {
            newUser.setImageUrl(null);
        }

        userRepository.save(newUser);
        return ResponseEntity.ok("Account created successfully");
    }

    @GetMapping("/warehouses")
    public List<Warehouse> getWarehouses() {
        return warehouseRepository.findAll();
    }
}
