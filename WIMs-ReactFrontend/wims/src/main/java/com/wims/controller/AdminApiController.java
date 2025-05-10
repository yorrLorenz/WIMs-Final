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
        .map(log -> {
            DashboardLogDTO dto = new DashboardLogDTO(
                log.getId(),
                log.getDateTime(),
                log.getUsername(),
                log.getAction(),
                log.getItem(),
                log.getWarehouse(),
                log.getLocation(),
                log.getGroupId()
            );

            if (log.getGroupId() != null && !log.getGroupId().isBlank()) {
                List<DashboardLogDTO> related = logRepository.findByGroupId(log.getGroupId())
                    .stream()
                    .map(r -> new DashboardLogDTO(
                        r.getId(),
                        r.getDateTime(),
                        r.getUsername(),
                        r.getAction(),
                        r.getItem(),
                        r.getWarehouse(),
                        r.getLocation(),
                        r.getGroupId()
                    ))
                    .collect(Collectors.toList());

                dto.setRelatedLogs(related);
            }

            return dto;
        })
        .collect(Collectors.toList());

    return new DashboardResponseDTO("All Warehouses", dtos);
}

   

}

