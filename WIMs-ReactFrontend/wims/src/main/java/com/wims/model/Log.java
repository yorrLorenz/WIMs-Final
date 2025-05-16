package com.wims.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "logs")
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_time")
    private Instant dateTime;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(name = "action")
    private String action;

    @Column(name = "item")
    private String item;

    @Column(name = "warehouse")
    private String warehouse;

    @Column(name = "location")
    private String location;

    @Column(name = "group_id")
    private String groupId;

    @Column(name = "units")
    private Integer units;

    @Column(name = "remaining_units")
    private Integer remainingUnits;

    @Column(name = "previous_location")
    private String previousLocation;

    @Transient
    private List<Log> relatedLogs;

    public Long getId() {
        return id;
    }

    public Instant getDateTime() {
        return dateTime;
    }

    public void setDateTime(Instant dateTime) {
        this.dateTime = dateTime;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public String getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(String warehouse) {
        this.warehouse = warehouse;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public Integer getUnits() {
        return units;
    }

    public void setUnits(Integer units) {
        this.units = units;
    }

    public Integer getRemainingUnits() {
        return remainingUnits;
    }

    public void setRemainingUnits(Integer remainingUnits) {
        this.remainingUnits = remainingUnits;
    }

    public String getPreviousLocation() {
        return previousLocation;
    }

    public void setPreviousLocation(String previousLocation) {
        this.previousLocation = previousLocation;
    }

    public List<Log> getRelatedLogs() {
        return relatedLogs;
    }

    public void setRelatedLogs(List<Log> relatedLogs) {
        this.relatedLogs = relatedLogs;
    }

    @PrePersist
    public void beforePersist() {
        // Set timestamp in UTC if not set
        if (this.dateTime == null) {
            this.dateTime = Instant.now();
        }

        // Generate group ID if restocked and not present
        if ("Restocked".equalsIgnoreCase(action) && (groupId == null || groupId.isBlank())) {
            this.groupId = UUID.randomUUID().toString();
        }
    }
}
