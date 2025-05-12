package com.wims.controller;

import com.wims.dto.DashboardLogDTO;
import com.wims.dto.DashboardResponseDTO;
import com.wims.model.Log;
import com.wims.repository.LogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

    private final LogRepository logRepository;

    public AdminApiController(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @GetMapping("/logs")
    public DashboardResponseDTO getAllLogsForAdmin() {
        List<Log> logs = logRepository.findAllByOrderByDateTimeDesc();

        List<DashboardLogDTO> dtos = logs.stream().map(log -> {
            DashboardLogDTO dto = new DashboardLogDTO(
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
            );

            if (log.getGroupId() != null && !log.getGroupId().isBlank()) {
                List<DashboardLogDTO> related = logRepository.findByGroupId(log.getGroupId()).stream()
                        .map(r -> new DashboardLogDTO(
                                r.getId(),
                                r.getDateTime(),
                                r.getUsername(),
                                r.getAction(),
                                r.getItem(),
                                r.getWarehouse(),
                                r.getLocation(),
                                r.getGroupId(),
                                r.getUnits(),
                                r.getRemainingUnits(),
                                r.getPreviousLocation()
                        )).collect(Collectors.toList());

                dto.setRelatedLogs(related);
            }

            return dto;
        }).collect(Collectors.toList());

        return new DashboardResponseDTO("All Warehouses", dtos);
    }
}
