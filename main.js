document.addEventListener("DOMContentLoaded", () => {
    
    /* --- 第一階段：字體配對遊戲 --- */
    let selectedTag = null;
    const pool = document.getElementById('pool');
    const zones = document.querySelectorAll('.drop-zone');
    const tags = document.querySelectorAll('.drag-item');
    const totalTags = tags.length;

    // 點擊名牌
    tags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止觸發外層事件
            
            // 如果點擊的是已經放在格子裡的名牌，則退回下方選單
            if(tag.parentElement.classList.contains('drop-zone')) {
                pool.appendChild(tag);
                tag.parentElement.classList.remove('has-item');
                tag.classList.remove('selected');
                removeStamp(tag);
                selectedTag = null;
                hideResult();
            } else {
                // 否則為選取狀態
                tags.forEach(t => t.classList.remove('selected'));
                tag.classList.add('selected');
                selectedTag = tag;
            }
        });
    });

    // 點擊米字格
    zones.forEach(zone => {
        zone.addEventListener('click', () => {
            if (selectedTag) {
                // 如果格子內已經有名牌，先把它退回下方選單
                const existingItem = zone.querySelector('.drag-item');
                if (existingItem) {
                    pool.appendChild(existingItem);
                    removeStamp(existingItem);
                }
                
                // 把目前選取的名牌放進格子
                zone.appendChild(selectedTag);
                zone.classList.add('has-item');
                selectedTag.classList.remove('selected');
                selectedTag = null;
                
                checkCompletion();
            } else {
                // 如果沒有選取名牌，但是點擊了已有東西的格子，將其退回
                const existingItem = zone.querySelector('.drag-item');
                if (existingItem) {
                    pool.appendChild(existingItem);
                    zone.classList.remove('has-item');
                    removeStamp(existingItem);
                    hideResult();
                }
            }
        });
    });

    function removeStamp(tag) {
        const stamp = tag.querySelector('.stamp');
        if(stamp) stamp.remove();
    }

    function hideResult() {
        document.getElementById('result-msg').style.opacity = 0;
    }

    function checkCompletion() {
        // 計算放進格子的數量
        let placedCount = 0;
        zones.forEach(z => { if(z.querySelector('.drag-item')) placedCount++; });
        
        // 若全部排滿，執行對錯判定
        if (placedCount === totalTags) {
            evaluateAnswers();
        }
    }

    function evaluateAnswers() {
        let correctCount = 0;
        zones.forEach(zone => {
            const item = zone.querySelector('.drag-item');
            if (item) {
                removeStamp(item); // 先清理舊圖章
                const stamp = document.createElement('div');
                
                if (item.dataset.match === zone.dataset.match) {
                    correctCount++;
                    stamp.className = 'stamp correct';
                    stamp.innerHTML = '✓';
                } else {
                    stamp.className = 'stamp wrong';
                    stamp.innerHTML = '✗';
                }
                item.appendChild(stamp);
            }
        });

        const msgBox = document.getElementById('result-msg');
        if (correctCount === totalTags) {
            msgBox.style.color = "#4a5d23";
            msgBox.innerHTML = "全數配對正確！字字珠璣。";
        } else {
            msgBox.style.color = "#a32626";
            msgBox.innerHTML = `作答完成，共答對 ${correctCount} 個！`;
        }
        msgBox.style.opacity = 1;

        // 解鎖滾動報導
        unlockScrollytelling();
    }

    function unlockScrollytelling() {
        const report = document.getElementById('report-section');
        const indicator = document.getElementById('scroll-indicator');
        
        // 顯示報導區塊與向下指示器
        report.style.display = 'block';
        indicator.style.opacity = 1;
        
        // 重新喚醒 IntersectionObserver 以觸發文字動畫
        initScrollytelling();
    }

    /* --- 第二階段：滾動式報導特效 --- */
    function initScrollytelling() {
        const steps = document.querySelectorAll('.step');
        const bgChar = document.getElementById('bg-char');

        // 使用 IntersectionObserver 偵測滾動進度
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 內容淡入
                    entry.target.classList.add('active');
                    
                    // 更換背景毛筆大字，製造轉場漸變特效
                    const char = entry.target.getAttribute('data-char');
                    bgChar.style.opacity = 0;
                    setTimeout(() => {
                        bgChar.innerText = char;
                        bgChar.style.opacity = 0.05; // 顯示如浮水印般
                    }, 400);
                }
            });
        }, { threshold: 0.4 });

        steps.forEach(step => observer.observe(step));
    }
});