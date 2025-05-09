package com.wims.controller;
import com.wims.dto.DashboardLogDTO;
import com.wims.dto.DashboardResponseDTO;
import com.wims.model.Log;
import com.wims.repository.LogRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;




@RestController
@RequestMapping("/api/admin")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "https://wims-rosy.vercel.app"
    },
    allowCredentials = "true"
)
public class AdminApiController {

    private final LogRepository logRepository;

    public AdminApiController(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @GetMapping("/logs")
    public DashboardResponseDTO getAllLogsForAdmin() {
        List<Log> logs = logRepository.findAllByOrderByDateTimeDesc();

        List<DashboardLogDTO> dtos = logs.stream()
            .map(log -> new DashboardLogDTO(
                log.getId(),
                log.getDateTime(),
                log.getUsername(),
                log.getAction(),
                log.getItem(),
                log.getWarehouse(),
                log.getLocation(),
                log.getGroupId()
            ))
            .collect(Collectors.toList());

        return new DashboardResponseDTO("All Warehouses", dtos);
    }
   

}

