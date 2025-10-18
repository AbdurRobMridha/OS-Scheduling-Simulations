let processCount = 0;
let currentChartDisk = null;
let currentCtxCPU = null;

// Show/Hide Sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'cpu') updateCPUForm();
    if (sectionId === 'disk') updateDiskForm();
    if (sectionId === 'deadlock') updateBankerForm();
}

// CPU Scheduling
function updateCPUForm() {
    const algo = document.getElementById('cpuAlgo').value;
    document.getElementById('quantumDiv').classList.toggle('hidden', algo !== 'rr');
    processCount = 0;
    document.getElementById('processInputs').innerHTML = '';
    addProcess();
}

function addProcess() {
    const algo = document.getElementById('cpuAlgo').value;
    const div = document.createElement('div');
    div.className = 'process-div';
    div.id = `proc${processCount}`;
    let inputs = `<label>ID:</label><input type="text" class="procId" value="P${++processCount}">`;
    if (['rms', 'edf'].includes(algo)) {
        inputs += `
            <label>Execution Time:</label><input type="number" class="execTime" value="3" min="1">
            <label>Period:</label><input type="number" class="period" value="5" min="1">
            <label>Deadline:</label><input type="number" class="deadline" value="5" min="1">
        `;
    } else {
        inputs += `
            <label>Arrival Time:</label><input type="number" class="arrival" value="0" min="0">
            <label>Burst Time:</label><input type="number" class="burst" value="4" min="1">
        `;
        if (algo === 'priority') {
            inputs += `<label>Priority (lower = higher):</label><input type="number" class="priority" value="1" min="1">`;
        }
    }
    inputs += `<button type="button" onclick="this.parentElement.remove(); processCount--;">Remove</button>`;
    div.innerHTML = inputs;
    document.getElementById('processInputs').appendChild(div);
}

function computeCPU() {
    const algo = document.getElementById('cpuAlgo').value;
    let processes = [];
    document.querySelectorAll('.process-div').forEach(div => {
        const p = { id: div.querySelector('.procId').value };
        if (['rms', 'edf'].includes(algo)) {
            p.exec = parseInt(div.querySelector('.execTime').value);
            p.period = parseInt(div.querySelector('.period').value);
            p.deadline = parseInt(div.querySelector('.deadline').value);
            p.remaining = p.exec;
            p.release = 0;
            p.arrival = 0;
            p.burst = p.exec;
        } else {
            p.arrival = parseInt(div.querySelector('.arrival').value);
            p.burst = parseInt(div.querySelector('.burst').value);
            p.remaining = p.burst;
            if (div.querySelector('.priority')) p.priority = parseInt(div.querySelector('.priority').value);
        }
        processes.push(p);
    });
    let quantum = algo === 'rr' ? parseInt(document.getElementById('quantum').value) : 0;
    let result;
    switch (algo) {
        case 'fcfs': result = fcfs(processes); break;
        case 'sjf': result = sjf(processes, false); break;
        case 'srtf': result = sjf(processes, true); break;
        case 'rr': result = rr(processes, quantum); break;
        case 'priority': result = priorityScheduling(processes, false); break;
        case 'rms': result = rms(processes); break;
        case 'edf': result = edf(processes); break;
    }
    displayCPUResult(result);
    document.getElementById('cpuResults').classList.remove('hidden');
}

function fcfs(processes) {
    let sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    let gantt = [];
    let completion = {};
    sorted.forEach(p => {
        time = Math.max(time, p.arrival);
        let start = time;
        time += p.burst;
        gantt.push({ process: p.id, start, end: time });
        completion[p.id] = time;
    });
    return calculateAvgs(processes, completion, gantt);
}

function sjf(processes, preemptive) {
    let ready = [];
    let time = 0;
    let gantt = [];
    let index = 0;
    let completed = 0;
    let completion = {};
    while (completed < processes.length) {
        while (index < processes.length && processes[index].arrival <= time) {
            ready.push(processes[index++]);
        }
        if (ready.length === 0) {
            time++;
            continue;
        }
        let selected = preemptive 
            ? ready.reduce((min, p) => p.remaining < min.remaining ? p : min)
            : ready.reduce((min, p) => p.burst < min.burst ? p : min);
        let start = time;
        if (!preemptive) {
            time += selected.burst;
            gantt.push({ process: selected.id, start, end: time });
            completion[selected.id] = time;
            ready = ready.filter(p => p !== selected);
            completed++;
        } else {
            time++;
            selected.remaining--;
            gantt.push({ process: selected.id, start, end: time });
            if (selected.remaining === 0) {
                completion[selected.id] = time;
                ready = ready.filter(p => p !== selected);
                completed++;
            }
        }
    }
    return calculateAvgs(processes, completion, gantt);
}

function rr(processes, quantum) {
    let queue = [...processes].sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    let gantt = [];
    let index = 0;
    let completed = 0;
    let completion = {};
    while (completed < processes.length) {
        if (queue.length === 0 && index < processes.length) {
            time = processes[index].arrival;
        }
        if (queue.length > 0) {
            let current = queue[0];
            let slice = Math.min(quantum, current.remaining);
            let start = time;
            time += slice;
            current.remaining -= slice;
            gantt.push({ process: current.id, start, end: time });
            if (current.remaining > 0) {
                queue.push(queue.shift());
            } else {
                completion[current.id] = time;
                queue.shift();
                completed++;
            }
        } else {
            time++;
        }
    }
    return calculateAvgs(processes, completion, gantt);
}

function priorityScheduling(processes, preemptive) {
    let ready = [];
    let time = 0;
    let gantt = [];
    let index = 0;
    let completed = 0;
    let completion = {};
    while (completed < processes.length) {
        while (index < processes.length && processes[index].arrival <= time) {
            ready.push(processes[index++]);
        }
        if (ready.length === 0) {
            time++;
            continue;
        }
        let selected = preemptive 
            ? ready.reduce((min, p) => p.priority < min.priority ? p : min)
            : ready.reduce((min, p) => p.priority < min.priority ? p : min);
        let start = time;
        if (!preemptive) {
            time += selected.burst;
            gantt.push({ process: selected.id, start, end: time });
            completion[selected.id] = time;
            ready = ready.filter(p => p !== selected);
            completed++;
        } else {
            time++;
            selected.remaining--;
            gantt.push({ process: selected.id, start, end: time });
            if (selected.remaining === 0) {
                completion[selected.id] = time;
                ready = ready.filter(p => p !== selected);
                completed++;
            }
        }
    }
    return calculateAvgs(processes, completion, gantt);
}

function rms(processes) {
    processes.forEach(p => p.priority = p.period);
    let ready = [...processes];
    let time = 0;
    let gantt = [];
    let completed = 0;
    let completion = {};
    while (completed < processes.length) {
        if (ready.length === 0) {
            time++;
            continue;
        }
        let selected = ready.reduce((min, p) => p.priority < min.priority ? p : min);
        let start = time;
        time++;
        selected.remaining--;
        gantt.push({ process: selected.id, start, end: time });
        if (selected.remaining === 0) {
            completion[selected.id] = time;
            ready = ready.filter(p => p !== selected);
            completed++;
        }
    }
    return calculateAvgs(processes, completion, gantt, true);
}

function edf(processes) {
    processes.forEach(p => p.currentDeadline = p.deadline);
    let ready = [...processes];
    let time = 0;
    let gantt = [];
    let completed = 0;
    let completion = {};
    while (completed < processes.length) {
        if (ready.length === 0) {
            time++;
            continue;
        }
        let selected = ready.reduce((min, p) => p.currentDeadline < min.currentDeadline ? p : min);
        let start = time;
        time++;
        selected.remaining--;
        gantt.push({ process: selected.id, start, end: time });
        if (selected.remaining === 0) {
            completion[selected.id] = time;
            ready = ready.filter(p => p !== selected);
            completed++;
        }
    }
    return calculateAvgs(processes, completion, gantt, true);
}

function calculateAvgs(processes, completion, gantt, isRT = false) {
    gantt = mergeGantt(gantt);
    let turnaround = [];
    let waiting = [];
    processes.forEach(p => {
        let ct = completion[p.id];
        let tt = ct - p.arrival;
        let wt = tt - p.burst;
        turnaround.push(tt);
        waiting.push(wt);
    });
    let result = {
        processes,
        gantt,
        completion,
        turnaround,
        waiting,
        avgTurn: turnaround.reduce((a, b) => a + b, 0) / turnaround.length,
        avgWait: waiting.reduce((a, b) => a + b, 0) / waiting.length,
        isRT
    };
    if (isRT) {
        result.feasible = processes.every(p => completion[p.id] <= p.deadline);
    }
    return result;
}

function mergeGantt(gantt) {
    if (gantt.length === 0) return [];
    gantt.sort((a, b) => a.start - b.start);
    let merged = [gantt[0]];
    for (let i = 1; i < gantt.length; i++) {
        let last = merged[merged.length - 1];
        if (last.process === gantt[i].process && last.end === gantt[i].start) {
            last.end = gantt[i].end;
        } else {
            merged.push(gantt[i]);
        }
    }
    return merged;
}

function displayCPUResult(result) {
    const tbody = document.querySelector('#cpuTable tbody');
    tbody.innerHTML = '';
    result.processes.forEach((p, idx) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = p.id;
        row.insertCell(1).textContent = p.arrival || 0;
        row.insertCell(2).textContent = p.burst || p.exec || 0;
        row.insertCell(3).textContent = result.isRT ? (p.period || '-') : (p.priority || '-');
        row.insertCell(4).textContent = result.completion[p.id];
        row.insertCell(5).textContent = result.turnaround[idx];
        row.insertCell(6).textContent = result.waiting[idx];
    });
    let avgsHtml = `
        <p><strong>Average Turnaround Time:</strong> ${result.avgTurn.toFixed(2)}</p>
        <p><strong>Average Waiting Time:</strong> ${result.avgWait.toFixed(2)}</p>
    `;
    if (result.isRT) {
        avgsHtml += `<p><strong>Schedulable:</strong> ${result.feasible ? 'Yes' : 'No'}</p>`;
    }
    document.getElementById('cpuAvgs').innerHTML = avgsHtml;
    drawGanttCPU(result);
}

function drawGanttCPU(result) {
    const canvas = document.getElementById('ganttCPU');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = Math.max(200, result.processes.length * 40 + 50);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let maxTime = Math.max(...result.gantt.map(g => g.end));
    let scale = (canvas.width - 100) / maxTime;
    let procIndex = {};
    result.processes.forEach((p, i) => procIndex[p.id] = i);
    // Draw timeline
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(50, 25);
    ctx.lineTo(canvas.width - 10, 25);
    ctx.stroke();
    // Process labels and lines
    result.processes.forEach((p, i) => {
        let y = 30 + i * 40;
        ctx.fillStyle = '#333';
        ctx.fillText(p.id, 5, y + 5);
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(canvas.width - 10, y);
        ctx.stroke();
    });
    // Draw bars
    result.gantt.forEach(g => {
        let i = procIndex[g.process];
        let y = 30 + i * 40 - 10;
        let x = 50 + g.start * scale;
        let w = (g.end - g.start) * scale;
        ctx.fillStyle = `hsl(${(i * 60) % 360}, 70%, 50%)`;
        ctx.fillRect(x, y, w, 20);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, y, w, 20);
    });
    // Time ticks
    for (let t = 0; t <= maxTime; t += Math.max(1, Math.floor(maxTime / 10))) {
        let x = 50 + t * scale;
        ctx.fillStyle = '#333';
        ctx.fillText(t, x - 5, 45);
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, 30);
        ctx.stroke();
    }
}

// Disk Scheduling
function updateDiskForm() {
    const algo = document.getElementById('diskAlgo').value;
    const needsDir = ['scan', 'cscan', 'look', 'clook'].includes(algo);
    document.getElementById('directionDiv').classList.toggle('hidden', !needsDir);
}

function computeDisk() {
    const algo = document.getElementById('diskAlgo').value;
    let requests = document.getElementById('diskRequests').value.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
    let head = parseInt(document.getElementById('initialHead').value);
    let end = parseInt(document.getElementById('diskEnd').value);
    let dir = document.getElementById('direction').value;
    let result = diskScheduling(algo, requests, head, end, dir);
    displayDiskResult(result);
    document.getElementById('diskResults').classList.remove('hidden');
}

function diskScheduling(algo, requests, head, end, dir) {
    let current = head;
    let totalSeek = 0;
    let headMov = [head];
    let seekSeq = [];
    let queue = [...requests];
    if (algo === 'fcfs') {
        queue.forEach(req => {
            let seek = Math.abs(current - req);
            totalSeek += seek;
            seekSeq.push(seek);
            headMov.push(req);
            current = req;
        });
    } else if (algo === 'srtf') {
        while (queue.length > 0) {
            let nextReq = queue.reduce((closest, req) => {
                let dist = Math.abs(current - req);
                let closestDist = Math.abs(current - closest);
                return dist < closestDist ? req : closest;
            }, queue[0]);
            let seek = Math.abs(current - nextReq);
            totalSeek += seek;
            seekSeq.push(seek);
            headMov.push(nextReq);
            current = nextReq;
            queue = queue.filter(r => r !== nextReq);
        }
    } else if (['scan', 'look'].includes(algo)) {
        let isRight = dir === 'right';
        if (isRight) {
            let right = queue.filter(r => r >= head).sort((a, b) => a - b);
            right.forEach(req => {
                let seek = Math.abs(current - req);
                totalSeek += seek;
                seekSeq.push(seek);
                headMov.push(req);
                current = req;
            });
            let left = queue.filter(r => r < head).sort((a, b) => b - a);
            if (left.length > 0 || algo === 'scan') {
                if (algo === 'scan') {
                    let seekToEnd = end - current;
                    totalSeek += seekToEnd;
                    seekSeq.push(seekToEnd);
                    headMov.push(end);
                    current = end;
                }
                left.forEach(req => {
                    let seek = Math.abs(current - req);
                    totalSeek += seek;
                    seekSeq.push(seek);
                    headMov.push(req);
                    current = req;
                });
            }
        } else {
            let leftReqs = queue.filter(r => r < head).sort((a, b) => b - a);
            leftReqs.forEach(req => {
                let seek = Math.abs(current - req);
                totalSeek += seek;
                seekSeq.push(seek);
                headMov.push(req);
                current = req;
            });
            let right = queue.filter(r => r >= head).sort((a, b) => a - b);
            if (right.length > 0 || algo === 'scan') {
                if (algo === 'scan') {
                    let seekToStart = current - 0;
                    totalSeek += seekToStart;
                    seekSeq.push(seekToStart);
                    headMov.push(0);
                    current = 0;
                }
                right.forEach(req => {
                    let seek = Math.abs(current - req);
                    totalSeek += seek;
                    seekSeq.push(seek);
                    headMov.push(req);
                    current = req;
                });
            }
        }
    } else if (['cscan', 'clook'].includes(algo)) {
        let isRight = dir === 'right';
        if (isRight) {
            let right = queue.filter(r => r >= head).sort((a, b) => a - b);
            right.forEach(req => {
                let seek = Math.abs(current - req);
                totalSeek += seek;
                seekSeq.push(seek);
                headMov.push(req);
                current = req;
            });
            let left = queue.filter(r => r < head).sort((a, b) => a - b);
            if (left.length > 0) {
                if (algo === 'cscan') {
                    let seekToEnd = end - current;
                    totalSeek += seekToEnd;
                    seekSeq.push(seekToEnd);
                    headMov.push(end);
                    current = end;
                    let seekToZero = current - 0;
                    totalSeek += seekToZero;
                    seekSeq.push(seekToZero);
                    headMov.push(0);
                    current = 0;
                    let first = left[0];
                    let firstSeek = Math.abs(current - first);
                    totalSeek += firstSeek;
                    seekSeq.push(firstSeek);
                    headMov.push(first);
                    current = first;
                    let remainingLeft = left.slice(1);
                    remainingLeft.forEach(req => {
                        let seek = req - current;
                        totalSeek += seek;
                        seekSeq.push(seek);
                        headMov.push(req);
                        current = req;
                    });
                } else {
                    let first = left[0];
                    let seek = current - first;
                    totalSeek += seek;
                    seekSeq.push(seek);
                    headMov.push(first);
                    current = first;
                    let remainingLeft = left.slice(1);
                    remainingLeft.forEach(req => {
                        let seek = req - current;
                        totalSeek += seek;
                        seekSeq.push(seek);
                        headMov.push(req);
                        current = req;
                    });
                }
            } else if (algo === 'cscan') {
                let seekToEnd = end - current;
                totalSeek += seekToEnd;
                seekSeq.push(seekToEnd);
                headMov.push(end);
                current = end;
                let seekToZero = current - 0;
                totalSeek += seekToZero;
                seekSeq.push(seekToZero);
                headMov.push(0);
                current = 0;
            }
        } else {
            let leftReqs = queue.filter(r => r < head).sort((a, b) => b - a);
            leftReqs.forEach(req => {
                let seek = Math.abs(current - req);
                totalSeek += seek;
                seekSeq.push(seek);
                headMov.push(req);
                current = req;
            });
            let right = queue.filter(r => r >= head).sort((a, b) => a - b);
            if (right.length > 0) {
                if (algo === 'cscan') {
                    let seekToStart = current - end;
                    totalSeek += Math.abs(seekToStart);
                    seekSeq.push(Math.abs(seekToStart));
                    headMov.push(end);
                    current = end;
                    let first = right[0];
                    let firstSeek = Math.abs(current - first);
                    totalSeek += firstSeek;
                    seekSeq.push(firstSeek);
                    headMov.push(first);
                    current = first;
                    let remainingRight = right.slice(1);
                    remainingRight.forEach(req => {
                        let seek = Math.abs(current - req);
                        totalSeek += seek;
                        seekSeq.push(seek);
                        headMov.push(req);
                        current = req;
                    });
                } else {
                    let first = right[0];
                    let seek = Math.abs(current - first);
                    totalSeek += seek;
                    seekSeq.push(seek);
                    headMov.push(first);
                    current = first;
                    let remainingRight = right.slice(1);
                    remainingRight.forEach(req => {
                        let seek = Math.abs(current - req);
                        totalSeek += seek;
                        seekSeq.push(seek);
                        headMov.push(req);
                        current = req;
                    });
                }
            } else if (algo === 'cscan') {
                let seekToStart = current - end;
                totalSeek += Math.abs(seekToStart);
                seekSeq.push(Math.abs(seekToStart));
                headMov.push(end);
                current = end;
            }
        }
    }
    return { headMov, seekSeq, totalSeek };
}

function displayDiskResult(result) {
    const tbody = document.querySelector('#diskTable tbody');
    tbody.innerHTML = '';
    for (let i = 0; i < result.headMov.length - 1; i++) {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = result.headMov[i + 1];
        row.insertCell(1).textContent = result.seekSeq[i];
    }
    document.getElementById('diskTotal').innerHTML = `<p><strong>Total Seek Time / Overhead:</strong> ${result.totalSeek}</p><p><strong>Total Arm Movements:</strong> ${result.headMov.length - 1}</p>`;
    const ctx = document.getElementById('diskChart').getContext('2d');
    if (currentChartDisk) currentChartDisk.destroy();
    currentChartDisk = new Chart(ctx, {
        type: 'line',
        data: {
            labels: result.headMov.map((_, i) => `Step ${i}`),
            datasets: [{
                label: 'Head Position',
                data: result.headMov,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: Math.max(...result.headMov) * 1.1 }
            }
        }
    });
}

// Deadlock Avoidance
function updateBankerForm() {
    const np = parseInt(document.getElementById('numProc').value);
    const nr = parseInt(document.getElementById('numRes').value);
    let maxHtml = '<h3>Maximum Claim Matrix</h3><table><thead><tr><th>Process</th>';
    for (let j = 0; j < nr; j++) maxHtml += `<th>R${j}</th>`;
    maxHtml += '</tr></thead><tbody>';
    for (let i = 0; i < np; i++) {
        maxHtml += `<tr><th>P${i}</th>`;
        for (let j = 0; j < nr; j++) {
            maxHtml += `<td><input type="number" class="maxP${i}R${j}" value="${7 + Math.floor(Math.random() * 3)}" min="0"></td>`;
        }
        maxHtml += '</tr>';
    }
    maxHtml += '</tbody></table>';
    document.getElementById('maxMatrix').innerHTML = maxHtml;

    let allocHtml = '<h3>Allocated Matrix</h3><table><thead><tr><th>Process</th>';
    for (let j = 0; j < nr; j++) allocHtml += `<th>R${j}</th>`;
    allocHtml += '</tr></thead><tbody>';
    for (let i = 0; i < np; i++) {
        allocHtml += `<tr><th>P${i}</th>`;
        for (let j = 0; j < nr; j++) {
            allocHtml += `<td><input type="number" class="allocP${i}R${j}" value="${Math.floor(Math.random() * 3)}" min="0"></td>`;
        }
        allocHtml += '</tr>';
    }
    allocHtml += '</tbody></table>';
    document.getElementById('allocMatrix').innerHTML = allocHtml;

    let availHtml = '<h3>Available Resources</h3><div>';
    for (let j = 0; j < nr; j++) {
        availHtml += `<label>R${j}:</label><input type="number" class="availR${j}" value="${3 + Math.floor(Math.random() * 2)}" min="0"> `;
    }
    availHtml += '</div>';
    document.getElementById('available').innerHTML = availHtml;
}

function computeBanker() {
    const np = parseInt(document.getElementById('numProc').value);
    const nr = parseInt(document.getElementById('numRes').value);
    let max = Array.from({length: np}, () => Array(nr).fill(0));
    let allocation = Array.from({length: np}, () => Array(nr).fill(0));
    let available = Array(nr).fill(0);
    for (let i = 0; i < np; i++) {
        for (let j = 0; j < nr; j++) {
            max[i][j] = parseInt(document.querySelector(`.maxP${i}R${j}`).value);
            allocation[i][j] = parseInt(document.querySelector(`.allocP${i}R${j}`).value);
        }
    }
    for (let j = 0; j < nr; j++) {
        available[j] = parseInt(document.querySelector(`.availR${j}`).value);
    }
    let need = max.map((row, i) => row.map((v, j) => v - allocation[i][j]));
    // Safety Algorithm
    let work = [...available];
    let finish = new Array(np).fill(false);
    let safeSeq = [];
    let i = 0;
    while (i < np) {
        if (!finish[i] && need[i].every((n, j) => n <= work[j])) {
            for (let j = 0; j < nr; j++) work[j] += allocation[i][j];
            finish[i] = true;
            safeSeq.push(i);
            i = 0; // Restart
        } else {
            i++;
        }
    }
    const isSafe = safeSeq.length === np;
    document.getElementById('safeSequence').innerHTML = `<p><strong>Safe State:</strong> ${isSafe ? `Yes - Sequence: ${safeSeq.map(s => `P${s}`).join(' → ')}` : 'No (Deadlock Possible)'}</p>`;
    // Need Table
    const tbody = document.querySelector('#needTable tbody');
    tbody.innerHTML = '';
    for (let i = 0; i < np; i++) {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = `P${i}`;
        for (let j = 0; j < nr; j++) {
            row.insertCell(j + 1).textContent = need[i][j];
        }
    }
    document.getElementById('bankerResults').classList.remove('hidden');
}

// Initialize
showSection('cpu');
updateBankerForm();
updateDiskForm();