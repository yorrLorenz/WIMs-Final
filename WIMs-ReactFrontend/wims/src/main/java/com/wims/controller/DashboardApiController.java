package com.wims.controller;

import com.wims.dto.DashboardLogDTO;
import com.wims.dto.DashboardResponseDTO;
import com.wims.model.Log;
import com.wims.model.Warehouse;
import com.wims.repository.LogRepository;
import com.wims.repository.WarehouseRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DashboardApiController {

    private final WarehouseRepository warehouseRepository;
    private final LogRepository logRepository;

    public DashboardApiController(WarehouseRepository warehouseRepository,
                                  LogRepository logRepository) {
        this.warehouseRepository = warehouseRepository;
        this.logRepository = logRepository;
    }

    @GetMapping("/dashboard/{warehouseId}")
    public DashboardResponseDTO getDashboardByWarehouse(@PathVariable String warehouseId) {
        // 1) load the Warehouse
        Warehouse warehouse = warehouseRepository.findByName(warehouseId)
            .orElseThrow(() -> new RuntimeException("Warehouse not found: " + warehouseId));

        // 2) fetch ALL logs for this warehouse, newest first
        List<Log> allLogs = logRepository.findByWarehouseOrderByDateTimeDesc(warehouse.getName());

        // 3) map each Log → DashboardLogDTO + one-level relatedLogs (now including itself)
        List<DashboardLogDTO> dtos = allLogs.stream()
            .map(log -> {
                // build the base DTO
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

                // if it has a groupId, pull in every member of that group
                if (log.getGroupId() != null) {
                    List<DashboardLogDTO> related = allLogs.stream()
                        .filter(l -> 
                            l.getGroupId() != null &&
                            l.getGroupId().equals(log.getGroupId())
                        )
                        .map(l -> new DashboardLogDTO(
                            l.getId(),
                            l.getDateTime(),
                            l.getUsername(),
                            l.getAction(),
                            l.getItem(),
                            l.getWarehouse(),
                            l.getLocation(),
                            l.getGroupId()
                        ))
                        .collect(Collectors.toList());

                    dto.setRelatedLogs(related);
                }

                return dto;
            })
            .collect(Collectors.toList());

        // 4) wrap and send
        return new DashboardResponseDTO(warehouse.getName(), dtos);
    }
    @GetMapping("/dashboard-by-date")
public DashboardResponseDTO getLogsByDateForWarehouse(
    @RequestParam("date") String date,
    @RequestParam("warehouse") String warehouse
) {
    LocalDate parsedDate = LocalDate.parse(date);
    LocalDateTime start = parsedDate.atStartOfDay();
    LocalDateTime end = parsedDate.atTime(23, 59, 59);

    List<Log> logs = logRepository.findByWarehouseAndDateTimeBetweenOrderByDateTimeDesc(
        warehouse, start, end
    );

    List<DashboardLogDTO> logDtos = logs.stream()
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

    return new DashboardResponseDTO(warehouse, logDtos);
}

}
