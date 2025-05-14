// com.wims.service.LogBroadcastService.java
package com.wims.service;

import com.wims.dto.DashboardLogDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class LogBroadcastService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastLogUpdate(DashboardLogDTO log) {
        if (log.getWarehouse() != null && !log.getWarehouse().isBlank()) {
            messagingTemplate.convertAndSend("/topic/logs/" + log.getWarehouse(), log); // for clerk
            messagingTemplate.convertAndSend("/topic/logs/admin", log); // for admin

        }
    }
}
