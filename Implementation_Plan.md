這是一份專為 Google Antigravity 設計的系統架構與 Implementation Plan 專案實作計畫。
我們選擇了業界極為穩定的開源腳手架組合：前端採用 [vite-react-ts-tailwind-firebase-starter](https://github.com/TeXmeijin/vite-react-ts-tailwind-firebase-starter)，後台則透過本地端 Node.js + Express 直接對 Git 目錄內的實體 JSON 進行讀寫與發布。
------------------------------
## Artifact: Implementation Plan - Fitness Coach Management System## 1. 目錄結構與資料流程## 1.1 專案目錄結構 (Monorepo 風格或雙主目錄結構)

fitness-coach-system/
├── package.json
├── .env.local                   # 本地環境變數（包含 Firebase Web Config）
├── coach-backend/               # 【教練本地管理後台】Node.js 執行環境
│   ├── server.js                # 本地 Express 伺服器主入口
│   ├── package.json
│   └── scripts/
│       └── deploy.js            # 自動化編譯與 Git 推送腳本
├── data/                        # 【本地核心資料庫】由後台直接讀寫的實體檔案
│   ├── user_profiles.json       # 學員基本資料與短中長週期規劃
│   └── workout_schedules.json   # 所有約課時段與每日訓練菜單
└── client-frontend/             # 【學員前台 + 統計】架設於 GitHub Pages (基於選定開源模板)
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── firebase.ts          # Firebase Authentication 初始化與實例配置
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── components/          # 簡約美觀的排版組件
    │   │   ├── Login.tsx        # 整合 Google 登入按鈕
    │   │   ├── Dashboard.tsx    # 學員主儀表板（串接 Firebase UID）
    │   │   ├── ScheduleView.tsx # 約課查看與日曆視圖
    │   │   └── WorkoutPlan.tsx  # 訓練菜單與週期規劃顯示
    │   └── data/
    │       └── importedData.ts  # 自動化腳本編譯後，供前端直接讀取的靜態資料 (來自 /data/)
    └── public/
        └── games/               # 未來預留：擴充宣傳用小遊戲的純靜態資源目錄

## 1.2 系統資料流程 (Data Flow)

【教練本地操作】
 本地網頁介面 (Localhost) ──> Express 伺服器 (server.js) ──> 寫入實體 JSON (/data/)
                                                               │
 【一鍵發布部署】                                               ▼
 GitHub Pages (github.io) <─── Git Push <─── 自動打包編譯 (deploy.js)
     │
     ▼
【學員線上瀏覽】
 學員瀏覽器 (github.io) ──> Google Auth 登入 ──> 取得 Firebase UID
                                                       │
                                                       ▼
 顯示篩選結果 <─── 比對 UID 與 importedData.ts 內對應的學員課表與預約時段

------------------------------
## 2. 核心模組虛擬碼 (Pseudocode)## 2.1 本地後台數據更新與自動部署模組 (coach-backend/scripts/deploy.js)

// 虛擬碼：執行本地 JSON 轉換為前端靜態 TS 檔案並部署至 GitHub
IMPORT child_process.execSync AS runCommand
IMPORT fs AS fileSystem

FUNCTION deployProject() {
    TRY {
        PRINT "Step 1: 讀取本地最新數據庫..."
        DATA students = fileSystem.readJson("../data/user_profiles.json")
        DATA workouts = fileSystem.readJson("../data/workout_schedules.json")

        PRINT "Step 2: 將 JSON 資料轉譯為靜態前端程式碼，確保安全隔離..."
        DATA tsContent = "export const STUDENT_PROFILES = " + STRINGIFY(students) + ";\n" +
                         "export const WORKOUT_SCHEDULES = " + STRINGIFY(workouts) + ";"
        
        fileSystem.write("../client-frontend/src/data/importedData.ts", tsContent)

        PRINT "Step 3: 開始執行前端 Production 編譯 (Vite SPA 打包)..."
        runCommand("npm run build", { cwd: "../client-frontend" })

        PRINT "Step 4: 執行自動化 Git 發布管線..."
        runCommand("git add .")
        runCommand("git commit -m 'Coach Auto Deploy: Update schedules and profiles'")
        runCommand("git push origin main")

        PRINT "🎉 部署大功告成！網站將於數分鐘內在 github.io 更新完成。"
    } CATCH (error) {
        PRINT "❌ 部署失敗原因: " + error.message
    }
}

## 2.2 前端學員身分驗證與資料過濾模組 (client-frontend/src/components/Dashboard.tsx)

// 虛擬碼：前端學員登入後，安全比對靜態包內的個人課表
IMPORT React, { useState, useEffect } from 'react'
IMPORT { getAuth, onAuthStateChanged } from 'firebase/auth'
IMPORT { STUDENT_PROFILES, WORKOUT_SCHEDULES } from '../data/importedData'

FUNCTION StudentDashboard() {
    DEFINE_STATE userUID = null
    DEFINE_STATE currentProfile = null
    DEFINE_STATE currentWorkouts = []
    DEFINE_STATE loading = true

    EFFECT_HOOK(() => {
        DATA auth = getAuth()
        // 監聽 Firebase Google 登入狀態
        onAuthStateChanged(auth, (user) => {
            IF (user EXISTS) {
                SET_STATE userUID = user.uid
                
                // 從包進來的靜態資料中，比對篩選出該 UID 的專屬學員檔案
                SET_STATE currentProfile = STUDENT_PROFILES.FIND(p => p.firebaseUID == user.uid)
                SET_STATE currentWorkouts = WORKOUT_SCHEDULES.FILTER(w => w.studentUID == user.uid)
            } ELSE {
                REDIRECT_TO_LOGIN()
            }
            SET_STATE loading = false
        })
    }, [])

    IF (loading) RETURN "載入教練專屬規劃中..."

    RETURN (
        <DIV class="dashboard-layout">
            <HEADER>歡迎回來, {currentProfile.name}</HEADER>
            <SECTION id="periodization">
                <H2>您的短中長期週期規劃</H2>
                <P>短期目標：{currentProfile.shortTermGoal}</P>
                <P>中期目標：{currentProfile.midTermGoal}</P>
                <P>長期目標：{currentProfile.longTermGoal}</P>
            </SECTION>
            <SECTION id="schedules">
                <H2>今日訓練菜單與約課時間表</H2>
                LIST_MAP(currentWorkouts, (item) => (
                    <CARD>
                        <TIME>{item.date} {item.timeSlot}</TIME>
                        <TEXT>訓練內容：{item.exercises.JOIN(", ")}</TEXT>
                    </CARD>
                ))
            </SECTION>
        </DIV>
    )
}

------------------------------
## 3. 中型功能區塊執行步驟清單 (Batch Coding Milestones)
這套清單是專為 Antigravity 高階設計、供低階 Agent 批次處理而設計。每個步驟皆以「功能區塊」為單位，具備高內聚性，防止代碼生成時因函數顆粒度太小而產生斷層。
## 🧱 區塊一：初始化本地資料庫結構與 Express API 後台 (教練本地端)

* 
* 目標：建立 Node.js 基礎環境與 JSON 資料欄位規範，確保能透過本地 API 完成基本讀寫。
* Agent 批次執行工作：
1. 在 coach-backend/ 初始化 package.json，安裝 express、cors、body-parser。
   2. 在 data/user_profiles.json 定義學員資料結構：包含 id, firebaseUID, name, phone, shortTermGoal, midTermGoal, longTermGoal。
   3. 在 data/workout_schedules.json 定義課表結構：包含 id, studentUID, date, timeSlot, exercises (陣列), status (已預約/已完成)。
   4. 撰寫 coach-backend/server.js，實作 GET/POST 路由，允許教練在本地新增、修改上述兩個 JSON 檔案的資料。
* 

## 🧱 區塊二：建立一鍵自動化編譯與 Git 發布腳本 (deploy.js)

* 
* 目標：將教練在本地更新的實體 JSON 數據，無縫轉換為前端可封裝的靜態模組並實行 Git 自動化推送。
* Agent 批次執行工作：
1. 於 coach-backend/scripts/deploy.js 撰寫完整的自動化打包程序。
   2. 程式須讀取實體 JSON 內容，轉換成符合 ES Module 規範的字串（export const ...）。
   3. 程式自動將該字串寫入到前端專案的 client-frontend/src/data/importedData.ts。
   4. 透過 Node.js 的 child_process 模組，依序自動在 Terminal 執行 npm run build、git add .、git commit -m "[System] Coach Portal Auto Update" 及 git push origin main。
* 

## 🧱 區塊三：建構前端框架並配接 Firebase Google 驗證

* 
* 目標：讓前端靜態網站具備 Google 登入能力，並妥善取得學員 UID。
* Agent 批次執行工作：
1. 將開源腳手架 vite-react-ts-tailwind-firebase-starter 的程式碼結構導入 client-frontend/ 中。
   2. 設置 client-frontend/src/firebase.ts，配置 Firebase 初始化代碼，並使用 GoogleAuthProvider。
   3. 撰寫 Login.tsx 組件，提供一個簡約清爽的 Google 登入按鈕，登入成功後將學員的 Firebase User 物件綁定到全域或 Context 狀態中。
* 

## 🧱 區塊四：實作學員極簡前台儀表板（週期規劃、約課、課表檢視）

* 
* 目標：學員透過手機或電腦打開網頁時，能極簡流暢地看到教練給他的所有排課與規劃。
* Agent 批次執行工作：
1. 撰寫 Dashboard.tsx，使用 Tailwind CSS 打造 Mobile-friendly、沉穩且具備現代感的深色/淺色健身管理風格介面。
   2. 實作過濾邏輯：讀取 importedData.ts 中的靜態陣列，利用目前已登入學員的 firebaseUID 進行陣列篩選（.filter() / .find()）。
   3. 區分三大視覺區塊呈現：
   * 週期檢視：以卡片形式展示短、中、長期核心目標規劃。
      * 歷史與近期約課：以時間軸 (Timeline) 的極簡設計展示已預約的課表時間。
      * 當日課表：條列當天教練安排的動作名稱、組數、次數與備註，並具備打卡勾選功能（點擊可觸發預留的 Firebase Analytics 統計點）。
   * 