package com.wims.controller;

import com.wims.dto.DashboardLogDTO;
import com.wims.dto.DashboardResponseDTO;
import com.wims.model.Log;
import com.wims.model.User;
import com.wims.repository.LogRepository;
import com.wims.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/accounts")
public class AccountApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LogRepository logRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/my-logs")
    public ResponseEntity<List<DashboardLogDTO>> getCurrentUserLogs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Log> logs = logRepository.findByUserIdOrderByDateTimeDesc(user.getId());

        List<DashboardLogDTO> dtos = logs.stream()
            .map(log -> new DashboardLogDTO(
                log.getId(),
                log.getDateTime(),
                log.getUsername(),
                log.getAction(),
                log.getItem(),
                log.getWarehouse(),
                log.getLocation(),
                log.getGroupId(),
                log.getUnits(),
                log.getRemainingUnits(),
                log.getPreviousLocation()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/dashboard-by-date")
    public DashboardResponseDTO getLogsByDateForAdmin(@RequestParam("date") String date) {
        LocalDate parsedDate = LocalDate.parse(date);
        LocalDateTime start = parsedDate.atStartOfDay();
        LocalDateTime end = parsedDate.atTime(23, 59, 59);

        List<Log> logs = logRepository.findByDateTimeBetweenOrderByDateTimeDesc(start, end);

        List<DashboardLogDTO> dtos = logs.stream()
            .map(log -> new DashboardLogDTO(
                log.getId(),
                log.getDateTime(),
                log.getUsername(),
                log.getAction(),
                log.getItem(),
                log.getWarehouse(),
                log.getLocation(),
                log.getGroupId(),
                log.getUnits(),
                log.getRemainingUnits(),
                log.getPreviousLocation()
            ))
            .collect(Collectors.toList());

        return new DashboardResponseDTO("All Warehouses", dtos);
    }

    @GetMapping
    public List<User> getAllAccounts() {
        return userRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        Optional<User> targetUser = userRepository.findById(id);
        if (targetUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        if (targetUser.get().getUsername().equals(currentUsername)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You cannot delete your own account.");
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("Account deleted successfully");
    }
}
