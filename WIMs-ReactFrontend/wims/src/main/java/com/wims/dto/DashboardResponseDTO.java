package com.wims.dto;

import java.util.List;

public class DashboardResponseDTO {
    private String warehouseName;
    private List<DashboardLogDTO> logs;

    public DashboardResponseDTO(String warehouseName,
                                List<DashboardLogDTO> logs) {
        this.warehouseName = warehouseName;
        this.logs = logs;
    }

    public String getWarehouseName() { return warehouseName; }
    public List<DashboardLogDTO> getLogs()       { return logs; }
}
