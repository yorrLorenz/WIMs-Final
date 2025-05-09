package com.wims.controller;

import com.wims.dto.DashboardResponseDTO;
import com.wims.model.Log;
import com.wims.model.User;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.UserRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "https://wims-rosy.vercel.app"
    },
    allowCredentials = "true"
)
public class AccountApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ Create Account Endpoint
    // ✅ Create Account Endpoint with optional image URL
@PostMapping("")
public String createAccount(@RequestBody User user) {
    if (userRepository.findByUsername(user.getUsername()).isPresent()) {
        return "Username already exists";
    }

    user.setPassword(passwordEncoder.encode(user.getPassword()));

    if (user.getImageUrl() == null || user.getImageUrl().isBlank()) {
        user.setImageUrl("/default-silhouette.png"); // default silhouette path
    }

    userRepository.save(user);
    return "Account created";
}

// ✅ Fetch current user info for profile screen
@GetMapping("/me")
public User getCurrentUser(Principal principal) {
    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    // ✅ Normalize imageUrl: set to null if empty string
    if (user.getImageUrl() != null && user.getImageUrl().trim().isEmpty()) {
        user.setImageUrl(null);
    }

    return user;
}




    // ✅ Standard Dashboard for Current User
    @GetMapping("/dashboard")
    public DashboardResponseDTO getDashboardLogs(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return getDashboardByWarehouse(user.getWarehouse());
    }

    // ✅ Specific Warehouse Dashboard
    @GetMapping("/dashboard/{warehouseId}")
    public DashboardResponseDTO getDashboardByWarehouse(@PathVariable String warehouseId) {
        Optional<Warehouse> optionalWarehouse = warehouseRepository.findByName(warehouseId);
        if (optionalWarehouse.isEmpty()) {
            throw new RuntimeException("Warehouse not found");
        }

        List<Log> logs = logRepository.findByWarehouseOrderByDateTimeDesc(warehouseId);

        for (Log log : logs) {
            log.setRelatedLogs(null); // ensure minimal data payload
        }

        return new DashboardResponseDTO(warehouseId, logs);
    }

    // ✅ Date-based Dashboard for Admin or Clerk
    @GetMapping("/dashboard-by-date")
public DashboardResponseDTO getDashboardByDate(@RequestParam String date, Principal principal) {
    String username = principal.getName();
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

    String role = user.getRole();
    String warehouse = user.getWarehouse();

    LocalDate targetDate = LocalDate.parse(date);
    LocalDateTime startOfDay = targetDate.atStartOfDay();
    LocalDateTime endOfDay = targetDate.atTime(23, 59, 59);

    List<Log> logs;

    if ("ADMIN".equalsIgnoreCase(role)) {
        // ✅ Admin sees all logs from all warehouses
        logs = logRepository.findByDateTimeBetweenOrderByDateTimeDesc(startOfDay, endOfDay);
    } else {
        // ✅ Clerk sees only their assigned warehouse's logs
        logs = logRepository.findByWarehouseAndDateTimeBetweenOrderByDateTimeDesc(
                warehouse, startOfDay, endOfDay);
    }

    logs.forEach(log -> log.setRelatedLogs(null));

    return new DashboardResponseDTO(
            "ADMIN".equalsIgnoreCase(role) ? "All Warehouses" : warehouse,
            logs
    );
}


    @GetMapping("/warehouses")
public List<String> getWarehouseNames() {
    return warehouseRepository.findAll()
        .stream()
        .map(Warehouse::getName)
        .toList();
}

@GetMapping("/my-logs")
public List<Log> getLogsForCurrentUser(Principal principal) {
    String username = principal.getName();
    return logRepository.findByUsernameOrderByDateTimeDesc(username);
}


}
