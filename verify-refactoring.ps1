#!/usr/bin/env pwsh

# Homepage Refactoring Verification Script
# Run this to verify the Server Component refactoring was successful

Write-Host "=" * 70
Write-Host "HOMEPAGE SERVER COMPONENT REFACTORING - VERIFICATION"
Write-Host "=" * 70

$allPassed = $true

# Test 1: Check main page is NOT a client component
Write-Host "`n[TEST 1] Verifying app/page.tsx is a Server Component..."
$hasUseClient = Select-String -Path "app\page.tsx" -Pattern "^'use client'" -Quiet
if ($hasUseClient) {
    Write-Host "❌ FAILED: app/page.tsx still has 'use client' directive" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "✅ PASSED: app/page.tsx is a Server Component" -ForegroundColor Green
}

# Test 2: Check async function
Write-Host "`n[TEST 2] Verifying page component is async..."
$hasAsync = Select-String -Path "app\page.tsx" -Pattern "export default async function" -Quiet
if ($hasAsync) {
    Write-Host "✅ PASSED: HomePage is an async function" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: HomePage is not async" -ForegroundColor Red
    $allPassed = $false
}

# Test 3: Check all landing components exist
Write-Host "`n[TEST 3] Verifying all landing components exist..."
$components = @(
    "components\landing\ambient-background.tsx",
    "components\landing\navigation.tsx",
    "components\landing\hero-section.tsx",
    "components\landing\features-section.tsx",
    "components\landing\how-it-works-section.tsx",
    "components\landing\testimonials-section.tsx",
    "components\landing\pricing-section.tsx",
    "components\landing\contact-section.tsx",
    "components\landing\footer-section.tsx"
)

$componentsPassed = $true
foreach ($comp in $components) {
    if (Test-Path $comp) {
        Write-Host "  ✅ $comp" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MISSING: $comp" -ForegroundColor Red
        $componentsPassed = $false
        $allPassed = $false
    }
}

if ($componentsPassed) {
    Write-Host "✅ PASSED: All 9 components exist" -ForegroundColor Green
}

# Test 4: Check server i18n utility exists
Write-Host "`n[TEST 4] Verifying server-side i18n utility..."
if (Test-Path "lib\i18n-server.ts") {
    Write-Host "✅ PASSED: lib/i18n-server.ts exists" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: lib/i18n-server.ts missing" -ForegroundColor Red
    $allPassed = $false
}

# Test 5: Check client components have 'use client'
Write-Host "`n[TEST 5] Verifying client components have 'use client'..."
$clientComponents = @(
    "components\landing\navigation.tsx",
    "components\landing\pricing-section.tsx",
    "components\landing\footer-section.tsx"
)

$clientPassed = $true
foreach ($comp in $clientComponents) {
    $hasDirective = Select-String -Path $comp -Pattern "^'use client'" -Quiet
    if ($hasDirective) {
        Write-Host "  ✅ $comp has 'use client'" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $comp missing 'use client'" -ForegroundColor Red
        $clientPassed = $false
        $allPassed = $false
    }
}

if ($clientPassed) {
    Write-Host "✅ PASSED: All client components properly marked" -ForegroundColor Green
}

# Test 6: Check server components DON'T have 'use client'
Write-Host "`n[TEST 6] Verifying server components are NOT client components..."
$serverComponents = @(
    "components\landing\ambient-background.tsx",
    "components\landing\hero-section.tsx",
    "components\landing\features-section.tsx",
    "components\landing\how-it-works-section.tsx",
    "components\landing\testimonials-section.tsx",
    "components\landing\contact-section.tsx"
)

$serverPassed = $true
foreach ($comp in $serverComponents) {
    $hasDirective = Select-String -Path $comp -Pattern "^'use client'" -Quiet
    if (-not $hasDirective) {
        Write-Host "  ✅ $comp is a Server Component" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $comp should NOT have 'use client'" -ForegroundColor Red
        $serverPassed = $false
        $allPassed = $false
    }
}

if ($serverPassed) {
    Write-Host "✅ PASSED: All server components properly configured" -ForegroundColor Green
}

# Test 7: Check backup exists
Write-Host "`n[TEST 7] Verifying backup of original page exists..."
if (Test-Path "app\page-old-client.tsx") {
    Write-Host "✅ PASSED: Backup exists at app/page-old-client.tsx" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: No backup found (non-critical)" -ForegroundColor Yellow
}

# Test 8: Line count reduction
Write-Host "`n[TEST 8] Checking code size reduction..."
$newPageLines = (Get-Content "app\page.tsx").Count
Write-Host "  New page.tsx: $newPageLines lines"

if (Test-Path "app\page-old-client.tsx") {
    $oldPageLines = (Get-Content "app\page-old-client.tsx").Count
    $reduction = [math]::Round((($oldPageLines - $newPageLines) / $oldPageLines) * 100, 1)
    Write-Host "  Old page.tsx: $oldPageLines lines"
    Write-Host "  Reduction: $reduction%" -ForegroundColor Green
    
    if ($newPageLines -lt 100) {
        Write-Host "✅ PASSED: Page size significantly reduced" -ForegroundColor Green
    }
}

# Summary
Write-Host "`n" + ("=" * 70)
if ($allPassed) {
    Write-Host "🎉 ALL TESTS PASSED - Refactoring Successful!" -ForegroundColor Green
    Write-Host "`nNext steps:"
    Write-Host "  1. Run: npm run build"
    Write-Host "  2. Run: npm run start"
    Write-Host "  3. Visit: http://localhost:3000"
    Write-Host "  4. Test all interactive features"
    Write-Host "  5. Run Lighthouse SEO audit"
} else {
    Write-Host "❌ SOME TESTS FAILED - Review errors above" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ("=" * 70)

# Return exit code
if ($allPassed) {
    exit 0
} else {
    exit 1
}
