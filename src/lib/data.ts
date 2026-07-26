/** Canonical origin — apex 307-redirects here, so www is the real home. */
export const SITE_URL = "https://www.sarisasaidinesh.com";

export const PROFILE = {
  name: "S. SAI DINESH",
  firstName: "Sarisa",
  role: "Robotics Engineer — Aerial Robotics & Autonomous Systems",
  status: "Robotics Engineer · Aerial Robotics · Autonomous Systems",
  taglines: [
    "autonomous drones · sensor fusion · Kalman filters",
    "precision landing · interception systems",
    "ROS/ROS2 · SLAM · MPC · real-time control",
    "aerial delivery · defense UAS · swarm systems",
    "bridging autonomy & aerospace robotics",
  ],
  bio: "Robotics Engineer specializing in autonomous aerial systems, sensor fusion, and defense-grade UAS. Currently at Arka Aerospace building autonomous interception drones with precision trajectory tracking and multi-sensor fusion. Previously at Skye Air Mobility developing precision landing, autonomous docking, and 4G-connected UAS delivery systems. Strong background in ROS/ROS2, Kalman filtering (EKF/UKF/LPF), MPC, PID control, and real-time embedded systems.",
  about: {
    lead: "I build autonomous aerial systems that operate reliably in contested, GPS-denied, and dynamic environments — from precision delivery drones to defense-grade interception UAS.",
    p2: "At Arka Aerospace, I design control algorithms for autonomous drone interception, implementing sensor fusion pipelines with EKF/UKF/Low-Pass filters for precise state estimation in adversarial conditions. My work spans the full autonomy stack: perception (AprilTag, SLAM), planning (trajectory optimization, MPC), and control (PID, MPC) on embedded platforms.",
    p3: "Previously at Skye Air Mobility, I developed cm-level precision landing and hovering for autonomous UAS delivery, integrated 4G/LTE connectivity for BVLOS operations, and built autonomous docking systems for cargo handling. Led the GNA Autoignite team to India Rank 4 at SAE INDIA AUTONOM 2021 — building a fully autonomous vehicle in IPG CarMaker with custom sensor fusion.",
    credentials: [
      "B.Tech Mechatronics Engineering — GNA University (2019–2023)",
      "SAE INDIA AUTONOM 2021 — Team Vice Captain, India Rank 4",
      "Machine Learning — NPTEL IIT Kharagpur",
      "Git & GitHub — Coursera",
      "Python Programming — Coursera",
    ],
  },
  email: "sarisasaidinesh2536@gmail.com",
  location: "Visakhapatnam, Andhra Pradesh, India",
  resume: "/Sarisa_Sai_Dinesh_Resume.pdf",
  siteUrl: `${SITE_URL}/`,
  socials: {
    github: "https://github.com/Dinesh25s",
    linkedin: "https://www.linkedin.com/in/sarisa-sai-dinesh",
    email: "mailto:sarisasaidinesh2536@gmail.com",
  },
};

export type Job = {
  company: string;
  title: string;
  range: string;
  location: string;
  blurb: string;
  points: string[];
};

export const EXPERIENCE: Job[] = [
  {
    company: "Arka Aerospace",
    title: "Robotics Software Engineer",
    range: "Jun 2024 — Present",
    location: "Hyderabad · Onsite",
    blurb:
      "Building autonomous interception drones with multi-sensor fusion, precision trajectory tracking, and defense-grade control systems for neutralizing rogue UAS threats.",
    points: [
      "Designed & implemented Control System Algorithm for autonomous interception drone — trajectory tracking, path planning, and real-time target neutralization",
      "Developed multi-sensor fusion pipeline integrating IMU, GPS, vision, and radar data using Extended Kalman Filter (EKF), Unscented Kalman Filter (UKF), and Low-Pass Filters for robust state estimation in dynamic environments",
      "Built complete Autonomous Precision Landing Algorithm using AprilTag detection — cm-level accuracy for GPS-denied recovery and shipboard operations",
      "Implemented ROS/ROS2 nodes for real-time control loops, sensor drivers, and inter-process communication on embedded Linux (NVIDIA Jetson / Raspberry Pi)",
      "Integrated SITL (Software-in-the-Loop) and HITL (Hardware-in-the-Loop) simulation pipelines with Gazebo, ArduPilot, and PX4 for rapid algorithm validation",
      "Optimized Monte Carlo analysis for stochastic reachability and collision probability assessment in adversarial scenarios",
      "Deployed TensorFlow/PyTorch models for onboard target detection and classification with TensorRT optimization on edge accelerators",
    ],
  },
  {
    company: "Skye Air Mobility",
    title: "UAS Research & Development Engineer",
    range: "Mar 2023 — Jun 2024",
    location: "Gurugram · Onsite",
    blurb:
      "Developed autonomous delivery UAS with precision landing, BVLOS connectivity, and cargo docking systems — enabling last-mile aerial logistics at scale.",
    points: [
      "Achieved cm-level precision landing & hovering for autonomous UAS delivery using computer vision (OpenCV) and ArduPilot/DroneKit integration",
      "Implemented 4G/LTE communication module for continuous BVLOS connectivity — real-time telemetry, command/control, and traffic awareness",
      "Designed Autonomous Docking System for secure cargo bay engagement — mechanical alignment, electromagnetic latching, and state verification",
      "Collaborated cross-functionally with avionics, mechanical, and operations teams for seamless integration of new autonomy features",
      "Developed novel solutions for complex engineering challenges — improved product reliability and reduced manufacturing costs through design optimization",
      "Managed multiple concurrent R&D projects — met all deadlines with efficient resource allocation and risk mitigation",
    ],
  },
  {
    company: "GNA University — Team GNA Autoignite",
    title: "Team Vice Captain",
    range: "Oct 2021 — Jul 2022",
    location: "Phagwara, Punjab · Onsite",
    blurb:
      "Led a 10-member team to India Rank 4 at SAE INDIA AUTONOM 2021 — building a fully autonomous vehicle for Indian road conditions in IPG CarMaker.",
    points: [
      "Developed sensor fusion models from scratch (LiDAR, camera, radar, IMU) for real-time perception in IPG CarMaker simulation environment",
      "Implemented autonomous navigation stack: path planning, obstacle avoidance, and vehicle control for Indian traffic scenarios",
      "Managed team of 10 engineers — coordinated mechanical, electrical, and software sub-teams; resolved technical blockers; ensured on-time delivery",
      "Gained hands-on experience in project management, leadership, problem-solving, and cross-disciplinary collaboration",
    ],
  },
];

export type Skill = {
  /** HUD module number, "01".."06" */
  num: string;
  name: string;
  items: string;
};

export const SKILLS: Skill[] = [
  { num: "01", name: "Robotics Frameworks", items: "ROS · ROS2 · ArduPilot · PX4 · Gazebo · RViz" },
  { num: "02", name: "State Estimation", items: "EKF · UKF · Kalman Filter · Low-Pass Filter · Sensor Fusion" },
  { num: "03", name: "Control Systems", items: "PID · MPC · LQR · Trajectory Tracking · Path Planning" },
  { num: "04", name: "Perception & AI", items: "OpenCV · AprilTag · SLAM · TensorFlow · PyTorch · TensorRT · YOLO" },
  { num: "05", name: "Simulation & Tools", items: "Gazebo · SITL · HITL · IPG CarMaker · MATLAB/Simulink · Monte Carlo" },
  { num: "06", name: "Languages & Embedded", items: "C++ · Python · C · MATLAB · Linux · NVIDIA Jetson · Raspberry Pi" },
];

export type Project = {
  id: string;
  title: string;
  meta: string;
  tagline: string;
  description: string;
  tags: string[];
  /** Gradient endpoints used to generate the orbiting card artwork. */
  colorA: string;
  colorB: string;
  /** External link (GitHub / demo). Null = no public link. */
  link: string | null;
  linkLabel?: string;
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "interception-drone",
    title: "Autonomous Interception Drone",
    meta: "2024–Present · Arka Aerospace · Defense",
    tagline: "Multi-sensor fusion + MPC for rogue UAS neutralization",
    description:
      "End-to-end autonomy stack for defense-grade interception drone: EKF/UKF sensor fusion (IMU + GPS + vision + radar), MPC-based trajectory tracking with real-time replanning, AprilTag precision landing for shipboard recovery, and Monte Carlo reachability analysis for engagement envelopes. Deployed on NVIDIA Jetson with ROS2 real-time nodes.",
    tags: ["ROS2", "EKF/UKF", "MPC", "AprilTag", "Jetson", "Gazebo", "C++", "Python"],
    colorA: "#ef4444",
    colorB: "#f97316",
    link: null,
    featured: true,
  },
  {
    id: "precision-landing",
    title: "Precision Landing & Docking System",
    meta: "2023–2024 · Skye Air Mobility · Aerial Delivery",
    tagline: "cm-level accuracy · 4G BVLOS · Autonomous cargo docking",
    description:
      "Autonomous delivery UAS system featuring vision-based precision landing (cm accuracy), 4G/LTE BVLOS connectivity for continuous telemetry & command, and electromechanical docking station for secure cargo transfer. Integrated ArduPilot, DroneKit, OpenCV, and AWS IoT for cloud-connected fleet management.",
    tags: ["ArduPilot", "DroneKit", "OpenCV", "4G/LTE", "AWS IoT", "Precision Landing", "Python"],
    colorA: "#3b82f6",
    colorB: "#06b6d4",
    link: null,
    featured: true,
  },
  {
    id: "autonom-vehicle",
    title: "SAE AUTONOM 2021 — Autonomous Vehicle",
    meta: "2021–2022 · GNA University · India Rank 4",
    tagline: "Full autonomy stack in IPG CarMaker · Sensor fusion from scratch",
    description:
      "Led 10-member team to build a fully autonomous vehicle for Indian road conditions. Implemented complete perception pipeline (LiDAR-camera-radar fusion), behavior planning, and low-level control in IPG CarMaker. Custom sensor models, Monte Carlo validation, and real-time path replanning for dynamic obstacles. Secured All India Rank 4 at SAE INDIA AUTONOM 2021.",
    tags: ["IPG CarMaker", "Sensor Fusion", "LiDAR", "Path Planning", "C++", "Python", "Monte Carlo"],
    colorA: "#8b5cf6",
    colorB: "#ec4899",
    link: "https://github.com/Dinesh25s",
    linkLabel: "GitHub Profile",
    featured: true,
  },
  {
    id: "sensor-fusion-toolkit",
    title: "Multi-Sensor Fusion Toolkit",
    meta: "2024 · Open Source · Robotics",
    tagline: "EKF/UKF/LPF fusion library for aerial robotics",
    description:
      "Modular C++/Python library for multi-sensor state estimation in aerial robots. Implements Extended Kalman Filter, Unscented Kalman Filter, and complementary Low-Pass Filters with configurable noise models. Supports IMU, GPS, barometer, visual odometry, and AprilTag measurements. Designed for real-time execution on embedded platforms (Jetson, Pixhawk).",
    tags: ["C++", "Python", "EKF", "UKF", "ROS2", "Embedded", "Sensor Fusion"],
    colorA: "#10b981",
    colorB: "#34d399",
    link: "https://github.com/Dinesh25s",
    linkLabel: "GitHub Profile",
    featured: false,
  },
  {
    id: "swarm-simulation",
    title: "UAS Swarm Simulation Framework",
    meta: "2024 · Research · Gazebo/ROS2",
    tagline: "Scalable multi-agent simulation for cooperative & adversarial scenarios",
    description:
      "High-fidelity Gazebo/ROS2 simulation environment for UAS swarm research. Supports 50+ agents with realistic aerodynamics, communication models (mesh, LTE, SATCOM), and sensor noise injection. Includes scenarios for cooperative search, formation flight, and adversarial interception. Used for validating multi-agent MPC and distributed consensus algorithms.",
    tags: ["Gazebo", "ROS2", "Swarm", "MPC", "Multi-Agent", "C++", "Python"],
    colorA: "#f59e0b",
    colorB: "#ef4444",
    link: "https://github.com/Dinesh25s",
    linkLabel: "GitHub Profile",
    featured: false,
  },
  {
    id: "ml-edge-deployment",
    title: "Onboard ML Deployment for UAS",
    meta: "2024 · Edge AI · TensorRT",
    tagline: "YOLO + TensorRT on Jetson for real-time target detection",
    description:
      "Optimized YOLOv8/v10 models for onboard deployment on NVIDIA Jetson Orin/Nano. TensorRT INT8 quantization, TensorRT-OSS plugins for custom layers, and DeepStream pipeline integration. Achieved >30 FPS at 640x640 with <50ms latency for target detection, classification, and tracking in GPS-denied interception scenarios.",
    tags: ["TensorRT", "YOLO", "Jetson", "DeepStream", "INT8", "CUDA", "C++", "Python"],
    colorA: "#2e7d32",
    colorB: "#22d3ee",
    link: "https://github.com/Dinesh25s",
    linkLabel: "GitHub Profile",
    featured: false,
  },
];

export const ARCHIVE_URL = "https://github.com/Dinesh25s";