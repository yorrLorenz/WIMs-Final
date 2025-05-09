package com.wims.controller;

import com.wims.dto.DashboardResponseDTO;
import com.wims.model.Log;
import com.wims.model.User;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.UserRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class DashboardApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private LogRepository logRepository;

    // For clerk users
    @GetMapping("/dashboard")
    public DashboardResponseDTO getDashboardLogs(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String warehouse = user.getWarehouse();
        if (warehouse == null) {
            return new DashboardResponseDTO(null, List.of()); // empty list for admins
        }

        List<Log> logs = logRepository.findByWarehouseOrderByDateTimeDesc(warehouse);
        logs.forEach(log -> log.setRelatedLogs(null));
        return new DashboardResponseDTO(warehouse, logs);
    }

    // For admins viewing specific warehouse dashboards
    @GetMapping("/dashboard/{warehouseId}")
    public DashboardResponseDTO getDashboardByWarehouse(@PathVariable String warehouseId) {
        Optional<Warehouse> optionalWarehouse = warehouseRepository.findByName(warehouseId);
        if (optionalWarehouse.isEmpty()) {
            throw new RuntimeException("Warehouse not found: " + warehouseId);
        }

        List<Log> logs = logRepository.findByWarehouseOrderByDateTimeDesc(warehouseId);
        logs.forEach(log -> log.setRelatedLogs(null));
        return new DashboardResponseDTO(warehouseId, logs);
    }

    // For admin calendar filter
    @GetMapping("/dashboard-by-date")
public DashboardResponseDTO getDashboardByDate(
        @RequestParam String date,
        @RequestParam String warehouse,  // <-- added
        Principal principal) {

    LocalDate targetDate = LocalDate.parse(date);
    LocalDateTime startOfDay = targetDate.atStartOfDay();
    LocalDateTime endOfDay = targetDate.atTime(23, 59, 59);

    // Logs for the specified warehouse
    List<Log> logs = logRepository.findByWarehouseAndDateTimeBetweenOrderByDateTimeDesc(
        warehouse, startOfDay, endOfDay
    );

    logs.forEach(log -> log.setRelatedLogs(null));

    return new DashboardResponseDTO(warehouse, logs);
}

// For Admin React Dashboard: all logs from all warehouses
@GetMapping("/admin/logs")
public DashboardResponseDTO getAllLogsForAdmin() {
    List<Log> logs = logRepository.findAllByOrderByDateTimeDesc();

    // ❌ REMOVE grouping logic
    logs.forEach(log -> log.setRelatedLogs(null));

    return new DashboardResponseDTO("All Warehouses", logs);
}




}
