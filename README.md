# OS-Scheduling-Simulations
OS Scheduling Simulations is an interactive web-based educational tool designed for Operating Systems laboratories. It simulates key scheduling algorithms for CPU, Disk, and Deadlock Avoidance, providing visual representations  to help students understand concepts like process management, disk head movement, and resource allocation.

# OS Scheduling Simulations

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html5.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

## Overview

**OS Scheduling Simulations** is an interactive web-based educational tool designed for Operating Systems laboratories. It simulates key scheduling algorithms for CPU, Disk, and Deadlock Avoidance, providing visual representations (Gantt charts, tables, and graphs) to help students understand concepts like process management, disk head movement, and resource allocation.

Built with modern web technologies, this project allows users to input parameters, select algorithms, and instantly visualize results. It's ideal for classroom demonstrations, self-study, or assignments in undergraduate OS courses.

- **Target Audience**: Computer Science students, educators, and OS enthusiasts.
- **Key Focus**: Hands-on simulation of algorithms such as FCFS, SJF, Round Robin, SCAN, and Banker's Algorithm.

## Features

### CPU Scheduling
- Supports **FCFS**, **SJF (Non-Preemptive)**, **SRTF (Preemptive SJF)**, **Round Robin**, **Priority Scheduling (Non-Preemptive)**, **Rate Monotonic Scheduling (RMS)**, and **Earliest Deadline First (EDF)**.
- Dynamic process addition with arrival times, burst times, priorities, and periods.
- Outputs: Process tables, Gantt charts, average turnaround/waiting times.

### Disk Scheduling
- Implements **FCFS**, **SSTF**, **SCAN**, **C-SCAN**, **LOOK**, and **C-LOOK**.
- Configurable initial head position, disk size, and request queue.
- Visualizes head movements with charts and total seek time calculations.

### Deadlock Avoidance
- Banker's Algorithm simulation for safe state detection.
- Configurable number of processes and resource types.
- Generates Need matrix, safe execution sequence, and resource availability tables.

- **Interactive UI**: Responsive design with form validation and real-time updates.
- **Visualization**: Powered by Chart.js for intuitive Gantt charts and movement graphs.
- **Extensible**: Modular JavaScript structure for easy addition of new algorithms.

## Demo

A live demo is hosted [here](https://os-scheduling-simulations.netlify.app/) 
## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge).
- No server required—runs entirely client-side.

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/abdur-rob-mridha/os-scheduling-simulations.git
   cd os-scheduling-simulations
   ```
2. Open `index.html` in your browser:
   ```
   # Simply double-click index.html or use a local server like Live Server in VS Code
   ```
   For development, serve via a local HTTP server to avoid CORS issues with external CDNs (e.g., `npx http-server` or Python's `python -m http.server`).

### Usage
1. **Navigate Sections**: Use the top navigation to switch between CPU, Disk, and Deadlock sections.
2. **Configure Inputs**:
   - Select an algorithm from the dropdown.
   - Enter process/request details via forms.
   - Adjust parameters like time quantum or initial head position.
3. **Compute & Visualize**:
   - Click "Compute" to run the simulation.
   - Review tables, charts, and summary statistics.
4. **Example Workflows**:
   - **CPU RR**: Add 3 processes (Arrivals: 0,1,2; Bursts: 5,3,8), set quantum=2 → View Gantt and averages.
   - **Disk SCAN**: Requests: 82,170,43,140,24,16,190; Head=50; Direction=Right → See total seek distance.


## Project Structure
```
os-scheduling-simulations/
├── index.html              # Main entry point with HTML structure
├── styles.css              # Responsive CSS for UI and layouts
├── app.js                  # Core JavaScript logic (simulations, DOM manipulation)
├── docs/                   # Documentation folder
│   └── ALGORITHMS.md       # Algorithm explanations and formulas
├── assets/                 # Images/icons (if any)
├── README.md               # This file
├── LICENSE                 # MIT License
└── .gitignore              # Standard Git ignores
```

## Contributing
Contributions are welcome! This project is perfect for adding new algorithms (e.g., MLQ) or improving visualizations.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/new-algorithm`.
3. Commit changes: `git commit -m "Add MLQ scheduling support"`.
4. Push: `git push origin feature/new-algorithm`.
5. Open a Pull Request.

### Guidelines
- Follow [ESLint](https://eslint.org/) for JS (install via npm if needed).
- Add unit tests with Jest for simulation logic.
- Update docs for new features.
- Ensure cross-browser compatibility.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- **Chart.js**: For powerful charting capabilities.
- **Inspiration**: Based on standard OS curricula (e.g., Silberschatz's *Operating System Concepts*).
- **Author**: Abdur Rob Mridha (Student ID: 347) – University OS Lab Project, 2025.

## Contact
- **Issues**: Open a GitHub issue for bugs or suggestions.
- **Email**: [abdur.rob.mridha@example.com](mailto:abdurobrob5411@gmail.com) (replace with actual).


---

*Built with ❤️ for OS education. Stars and feedback appreciated!*
