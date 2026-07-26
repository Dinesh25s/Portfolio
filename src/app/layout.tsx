import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import {
  PROFILE,
  SKILLS,
  PROJECTS,
  SITE_URL,
} from "@/lib/data";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const TITLE =
  "Sarisa Sai Dinesh — Robotics Software Engineer | Aerial Robotics · Defense UAS · Autonomous Systems";
const DESCRIPTION =
  "Robotics Software Engineer specializing in autonomous aerial systems, sensor fusion, and defense-grade UAS. Currently at Arka Aerospace building interception drones with EKF/UKF sensor fusion, MPC trajectory tracking, and precision landing. Previously at Skye Air Mobility developing BVLOS delivery UAS with cm-level precision landing, 4G connectivity, and autonomous docking. SAE INDIA AUTONOM 2021 — Team Vice Captain, India Rank 4.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Sarisa Sai Dinesh",
  },
  description: DESCRIPTION,
  applicationName: "Sarisa Sai Dinesh Portfolio",
  authors: [{ name: PROFILE.name, url: SITE_URL }],
  creator: PROFILE.name,
  publisher: PROFILE.name,
  category: "technology",
  keywords: [
    "Sarisa Sai Dinesh",
    "Sarisa Sai Dinesh portfolio",
    "Robotics Software Engineer",
    "Aerial Robotics Engineer",
    "Autonomous Systems Engineer",
    "UAS Engineer",
    "Drone Software Engineer",
    "Sensor Fusion Engineer",
    "Kalman Filter",
    "EKF UKF",
    "Model Predictive Control",
    "MPC",
    "ROS ROS2",
    "ArduPilot",
    "PX4",
    "Gazebo",
    "SLAM",
    "Computer Vision",
    "OpenCV",
    "AprilTag",
    "Precision Landing",
    "Autonomous Interception",
    "Defense UAS",
    "Counter-UAS",
    "Arka Aerospace",
    "Skye Air Mobility",
    "SAE AUTONOM",
    "Mechatronics Engineer",
    "Embedded Systems",
    "NVIDIA Jetson",
    "Python C++",
    "TensorRT",
    "YOLO",
    "Edge AI",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    firstName: PROFILE.firstName,
    lastName: "Dinesh",
    username: "sarisasaidinesh",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Sarisa Sai Dinesh Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@Dinesh25s",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030810",
  colorScheme: "dark",
};

/**
 * Rich, linked structured data (schema.org @graph). Answer engines and AI
 * crawlers use this to understand who Sarisa is, what she does, and what
 * she has built — the backbone of AEO / AI-SEO. Built from the same content
 * data that drives the site so it never drifts out of sync.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PROFILE.name,
      givenName: PROFILE.firstName,
      familyName: "Dinesh",
      jobTitle: PROFILE.role,
      description: PROFILE.bio,
      url: `${SITE_URL}/`,
      email: `mailto:${PROFILE.email}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Visakhapatnam",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
      worksFor: {
        "@type": "Organization",
        name: "Arka Aerospace",
      },
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: "GNA University",
        },
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: PROFILE.role,
        occupationLocation: {
          "@type": "City",
          name: "Hyderabad, India",
        },
        skills: SKILLS.map((s) => s.items).join(" · "),
      },
      knowsAbout: [
        "ROS",
        "ROS2",
        "ArduPilot",
        "PX4",
        "Gazebo",
        "SLAM",
        "Sensor Fusion",
        "Extended Kalman Filter (EKF)",
        "Unscented Kalman Filter (UKF)",
        "Model Predictive Control (MPC)",
        "PID Control",
        "Trajectory Tracking",
        "Path Planning",
        "Computer Vision",
        "OpenCV",
        "AprilTag",
        "Precision Landing",
        "Autonomous Navigation",
        "UAS",
        "Drone Software",
        "Counter-UAS",
        "Defense Robotics",
        "C++",
        "Python",
        "MATLAB",
        "Linux",
        "NVIDIA Jetson",
        "Raspberry Pi",
        "TensorFlow",
        "PyTorch",
        "TensorRT",
        "YOLO",
        "Edge AI",
        "Monte Carlo Analysis",
        "SITL",
        "HITL",
        "IPG CarMaker",
      ],
      sameAs: [
        PROFILE.socials.github,
        PROFILE.socials.linkedin,
        PROFILE.socials.email,
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Sarisa Sai Dinesh Portfolio",
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      name: TITLE,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#person` },
      mainEntity: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#projects`,
      name: "Projects by Sarisa Sai Dinesh",
      numberOfItems: PROJECTS.length,
      itemListElement: PROJECTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: p.title,
          description: p.description,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Linux, Embedded",
          programmingLanguage: p.tags.join(", "),
        },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0a0f14] text-[#e8eaed] antialiased">
        {children}
      </body>
    </html>
  );
}