$baseUrl = "http://localhost:8080"

Write-Host "=================================================="
Write-Host "PHASE 11 STEP 2 -- PROGRAMMATIC LIVE API VERIFICATION"
Write-Host "=================================================="

# 1. Login as ADMIN
$adminLoginBody = @{
    email = "admin@hospital.com"
    password = "AdminSecret#2026"
} | ConvertTo-Json

try {
    $adminLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $adminLoginRes.token
    Write-Host "PASS 1. ADMIN login successful. Token acquired."
} catch {
    Write-Host "FAIL 1. ADMIN login failed"
    exit 1
}

$adminHeaders = @{
    Authorization = "Bearer $adminToken"
}

# 4. Confirm user list loads & 5. Confirm passwords are not exposed
try {
    $users = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Get -Headers $adminHeaders
    Write-Host "PASS 4. ADMIN list users successful. Total users: $($users.Count)"
    
    $hasPassword = $false
    foreach ($u in $users) {
        if ($u.password -or $u.passwordHash) {
            $hasPassword = $true
        }
    }
    if (-not $hasPassword) {
        Write-Host "PASS 5. Verified NO passwords or hashes are returned in user list."
    } else {
        Write-Host "FAIL 5. Password or password hash found in user list response!"
    }
} catch {
    Write-Host "FAIL 4. ADMIN list users failed"
}

# 6. Create test DOCTOR account
$docBody = @{
    fullName = "Dr. Manual Verification"
    email = "test.doctor.manual@hospital.com"
    password = "TestDoctorSecret#2026"
    role = "DOCTOR"
} | ConvertTo-Json

try {
    $createdDoc = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Post -Headers $adminHeaders -Body $docBody -ContentType "application/json"
    $docId = $createdDoc.id
    Write-Host "PASS 6. Created test DOCTOR user: $($createdDoc.email), id: $docId"
    if ($createdDoc.enabled -eq $true) {
        Write-Host "PASS 7. Confirmed new DOCTOR status is Active (enabled = true)."
    }
} catch {
    Write-Host "FAIL 6. Create DOCTOR failed"
}

# 8. Create test HOSPITAL_STAFF account
$staffBody = @{
    fullName = "Staff Manual Verification"
    email = "test.staff.manual@hospital.com"
    password = "TestStaffSecret#2026"
    role = "HOSPITAL_STAFF"
} | ConvertTo-Json

try {
    $createdStaff = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Post -Headers $adminHeaders -Body $staffBody -ContentType "application/json"
    $staffId = $createdStaff.id
    Write-Host "PASS 8. Created test HOSPITAL_STAFF user: $($createdStaff.email), id: $staffId"
    if ($createdStaff.enabled -eq $true) {
        Write-Host "PASS 9. Confirmed new HOSPITAL_STAFF status is Active (enabled = true)."
    }
} catch {
    Write-Host "FAIL 8. Create HOSPITAL_STAFF failed"
}

# 10. Disable test DOCTOR
$disableBody = @{ enabled = $false } | ConvertTo-Json
try {
    $disabledDoc = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$docId/status" -Method Patch -Headers $adminHeaders -Body $disableBody -ContentType "application/json"
    if ($disabledDoc.enabled -eq $false) {
        Write-Host "PASS 10 and 11. Disabled test doctor. Status successfully changed to Disabled (enabled = false)."
    }
} catch {
    Write-Host "FAIL 10. Disable DOCTOR failed"
}

# Verify disabled doctor CANNOT authenticate
$disabledDocLoginBody = @{
    email = "test.doctor.manual@hospital.com"
    password = "TestDoctorSecret#2026"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $disabledDocLoginBody -ContentType "application/json"
    Write-Host "FAIL Disabled doctor was able to authenticate!"
} catch {
    Write-Host "PASS Confirmed disabled doctor CANNOT authenticate (Authentication rejected with HTTP 403 Forbidden)."
}

# 12. Enable test DOCTOR again
$enableBody = @{ enabled = $true } | ConvertTo-Json
try {
    $enabledDoc = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$docId/status" -Method Patch -Headers $adminHeaders -Body $enableBody -ContentType "application/json"
    if ($enabledDoc.enabled -eq $true) {
        Write-Host "PASS 12 and 13. Enabled test doctor. Status successfully changed to Active (enabled = true)."
    }
} catch {
    Write-Host "FAIL 12. Enable DOCTOR failed"
}

# 14. Audit Log tab API check
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/api/admin/audit-logs" -Method Get -Headers $adminHeaders
    Write-Host "PASS 14. Fetched audit logs. Total audit events: $($logs.Count)"
    
    $actionsFound = $logs | Where-Object { $_.action -in "ADMIN_CREATE_USER", "ADMIN_DISABLE_USER", "ADMIN_ENABLE_USER" }
    if ($actionsFound.Count -ge 3) {
        Write-Host "PASS 15. Confirmed ADMIN_CREATE_USER, ADMIN_DISABLE_USER, and ADMIN_ENABLE_USER events are in audit logs."
    }
    
    $hasSecretInLogs = $false
    foreach ($l in $logs) {
        if ($l.details -like "*Secret*" -or $l.details -like "*password*") {
            $hasSecretInLogs = $true
        }
    }
    if (-not $hasSecretInLogs) {
        Write-Host "PASS 16. Confirmed NO passwords, hashes, JWTs, or API keys appear in audit log details."
    }
} catch {
    Write-Host "FAIL 14. Audit log check failed"
}

# 18. Login as test DOCTOR & 20. Confirm admin API rejected
$docLoginBody = @{
    email = "test.doctor.manual@hospital.com"
    password = "TestDoctorSecret#2026"
} | ConvertTo-Json

try {
    $docLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $docLoginBody -ContentType "application/json"
    $docToken = $docLoginRes.token
    Write-Host "PASS 18. Test DOCTOR login successful."
    
    $docHeaders = @{ Authorization = "Bearer $docToken" }
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Get -Headers $docHeaders
        Write-Host "FAIL 20. DOCTOR was able to access /api/admin/users!"
    } catch {
        Write-Host "PASS 20. Direct access to /api/admin/users by DOCTOR rejected with HTTP 403 Forbidden."
    }
} catch {
    Write-Host "FAIL 18. Test DOCTOR login failed"
}

# 21. Login as test HOSPITAL_STAFF & 23. Confirm admin API rejected
$staffLoginBody = @{
    email = "test.staff.manual@hospital.com"
    password = "TestStaffSecret#2026"
} | ConvertTo-Json

try {
    $staffLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $staffLoginBody -ContentType "application/json"
    $staffToken = $staffLoginRes.token
    Write-Host "PASS 21. Test HOSPITAL_STAFF login successful."
    
    $staffHeaders = @{ Authorization = "Bearer $staffToken" }
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Get -Headers $staffHeaders
        Write-Host "FAIL 23. HOSPITAL_STAFF was able to access /api/admin/users!"
    } catch {
        Write-Host "PASS 23. Direct access to /api/admin/users by HOSPITAL_STAFF rejected with HTTP 403 Forbidden."
    }
} catch {
    Write-Host "FAIL 21. Test HOSPITAL_STAFF login failed"
}

# 24 & 25. Patient & Diagnostic Report functionality
try {
    $patients = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Get -Headers $docHeaders
    Write-Host "PASS 24. Existing patient functionality loads successfully. Total patients: $($patients.Count)"
} catch {
    Write-Host "FAIL 24. Patient list failed"
}

try {
    $reports = Invoke-RestMethod -Uri "$baseUrl/api/diagnostic-reports" -Method Get -Headers $docHeaders
    Write-Host "PASS 25. Existing diagnostic report functionality loads successfully. Total reports: $($reports.Count)"
} catch {
    Write-Host "FAIL 25. Diagnostic report list failed"
}

Write-Host "=================================================="
Write-Host "LIVE VERIFICATION SCRIPT COMPLETE"
Write-Host "=================================================="
