"use client";

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Page = () => {
  const router = useRouter();

  const pageRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const orbOneRef = useRef<HTMLDivElement>(null);
  const orbTwoRef = useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const goToLogin = () => {
    router.push("/login");
  };

  const scrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /*
   * ============================================================
   * GSAP ANIMATIONS
   * ============================================================
   */

  useEffect(() => {
    const ctx = gsap.context(() => {
      /*
       * ----------------------------------------------------------
       * HERO ENTRANCE
       * ----------------------------------------------------------
       */

      const heroTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      heroTimeline
        .fromTo(
          ".hero-badge",
          {
            y: 25,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
          }
        )
        .fromTo(
          ".hero-title",
          {
            y: 45,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
          },
          "-=0.4"
        )
        .fromTo(
          ".hero-description",
          {
            y: 25,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
          },
          "-=0.5"
        )
        .fromTo(
          ".hero-buttons",
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
          },
          "-=0.4"
        )
        .fromTo(
          ".hero-feature",
          {
            y: 18,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
          },
          "-=0.3"
        )
        .fromTo(
          heroVisualRef.current,
          {
            x: 70,
            opacity: 0,
            scale: 0.92,
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1.1,
          },
          "-=0.9"
        );

      /*
       * ----------------------------------------------------------
       * FLOATING EFFECTS
       * ----------------------------------------------------------
       */

      if (orbOneRef.current) {
        gsap.to(orbOneRef.current, {
          x: 35,
          y: -25,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (orbTwoRef.current) {
        gsap.to(orbTwoRef.current, {
          x: -30,
          y: 25,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      gsap.to(".route-card", {
        y: -10,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /*
       * ----------------------------------------------------------
       * SECTION REVEALS
       * ----------------------------------------------------------
       */

      gsap
        .utils
        .toArray<HTMLElement>(".reveal-section")
        .forEach((section) => {
          gsap.fromTo(
            section,
            {
              y: 60,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

      /*
       * ----------------------------------------------------------
       * FEATURE CARD REVEALS
       * ----------------------------------------------------------
       */

      gsap
        .utils
        .toArray<HTMLElement>(".feature-card")
        .forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              y: 45,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              delay: index * 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 87%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
    }, pageRef);

    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <Box
      ref={pageRef}
      sx={{
        width: "100%",
        overflow: "hidden",
        background: "#F7F9FC",
      }}
    >
      <NavBar />

      {/* ========================================================
          HERO
      ======================================================== */}

      <Box
        id="home"
        component="section"
        sx={{
          position: "relative",
          minHeight: {
            xs: "100svh",
            md: "100vh",
          },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",

          backgroundImage: "url('/ReaGae_Banner.png')",

          backgroundSize: "cover",

          backgroundPosition: {
            xs: "72% center",
            md: "center center",
          },
        }}
      >
        {/* Overlay */}

        <Box
          sx={{
            position: "absolute",
            inset: 0,

            background: {
              xs: `
                linear-gradient(
                  180deg,
                  rgba(250,252,255,0.96) 0%,
                  rgba(250,252,255,0.82) 40%,
                  rgba(250,252,255,0.28) 100%
                )
              `,

              md: `
                linear-gradient(
                  90deg,
                  rgba(250,252,255,0.98) 0%,
                  rgba(250,252,255,0.93) 30%,
                  rgba(250,252,255,0.58) 52%,
                  rgba(250,252,255,0.04) 80%
                )
              `,
            },
          }}
        />

        {/* Blue glow */}

        <Box
          ref={orbOneRef}
          sx={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 0,
            left: "10%",
            top: "10%",
            background:
              "radial-gradient(circle, rgba(41,82,204,0.17), transparent 70%)",
            filter: "blur(15px)",
            pointerEvents: "none",
          }}
        />

        {/* Red glow */}

        <Box
          ref={orbTwoRef}
          sx={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: 0,
            right: "8%",
            bottom: "8%",
            background:
              "radial-gradient(circle, rgba(227,38,54,0.13), transparent 70%)",
            filter: "blur(15px)",
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 2,
            pt: {
              xs: 11,
              md: 13,
            },
            pb: {
              xs: 7,
              md: 8,
            },
            px: {
              xs: 2.5,
              sm: 4,
              md: 7,
              lg: 10,
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.05fr .75fr",
              },
              alignItems: "center",
              gap: {
                xs: 5,
                md: 5,
                lg: 8,
              },
            }}
          >
            {/* ==================================================
                HERO CONTENT
            ================================================== */}

            <Stack
              ref={heroContentRef}
              sx={{
                maxWidth: 750,
                alignItems: {
                  xs: "center",
                  md: "flex-start",
                },
                textAlign: {
                  xs: "center",
                  md: "left",
                },
                gap: {
                  xs: 2.4,
                  md: 3,
                },
              }}
            >
              {/* Badge */}

              <Box
                className="hero-badge"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.1,
                  px: 1.8,
                  py: 0.9,
                  borderRadius: 0,

                  background: "rgba(255,255,255,0.65)",

                  border: "1px solid rgba(255,255,255,0.85)",

                  backdropFilter: "blur(18px)",

                  boxShadow:
                    "0 12px 30px rgba(20,35,70,0.08)",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: 0,
                    background: "#E32636",
                    boxShadow:
                      "0 0 15px rgba(227,38,54,0.65)",
                    animation: "pulse 2s infinite",

                    "@keyframes pulse": {
                      "0%,100%": {
                        transform: "scale(1)",
                      },

                      "50%": {
                        transform: "scale(.7)",
                      },
                    },
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: ".67rem",
                      sm: ".78rem",
                    },
                    fontWeight: 800,
                    color: "#19357F",
                    letterSpacing: ".4px",
                  }}
                >
                  LONG DISTANCE. BETTER TOGETHER.
                </Typography>
              </Box>

              {/* Title */}

              <Typography
                className="hero-title"
                component="h1"
                sx={{
                  fontWeight: 950,
                  color: "#091426",
                  fontSize: {
                    xs: "3rem",
                    sm: "4rem",
                    md: "5.2rem",
                    lg: "6rem",
                  },
                  lineHeight: 0.98,
                  letterSpacing: {
                    xs: "-2px",
                    md: "-4px",
                  },
                }}
              >
                Go Further.

                <Box
                  component="span"
                  sx={{
                    display: "block",
                    background:
                      "linear-gradient(110deg,#E32636,#F04B36,#E7A900)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Together.
                </Box>
              </Typography>

              {/* Description */}

              <Typography
                className="hero-description"
                sx={{
                  maxWidth: 590,
                  color: "rgba(20,35,55,.72)",
                  fontSize: {
                    xs: ".94rem",
                    sm: "1.05rem",
                    md: "1.18rem",
                  },
                  lineHeight: 1.75,
                }}
              >
                Find affordable long-distance rides, connect with
                trusted people and make every journey easier.
              </Typography>

              {/* Buttons */}

              <Stack
                className="hero-buttons"
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                  gap: 1.5,
                }}
              >
                {/* FIND A RIDE */}

                <Button
                  component={Link}
                  href="/rider/rides"
                  startIcon={<SearchIcon />}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 205,
                    },
                    py: 1.55,
                    borderRadius: 0,
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 800,

                    background:
                      "linear-gradient(135deg,#315CD6,#19347F)",

                    boxShadow:
                      "0 15px 35px rgba(41,82,204,.28)",

                    transition: "all .3s ease",

                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        "0 20px 42px rgba(41,82,204,.38)",
                    },
                  }}
                >
                  Find a Ride
                </Button>

                {/* BECOME A DRIVER */}

                <Button
                  component={Link}
                  href="/register?role=DRIVER"
                  startIcon={<PersonAddAlt1Icon />}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 205,
                    },
                    py: 1.55,
                    borderRadius: 0,
                    color: "#19347F",
                    textTransform: "none",
                    fontWeight: 800,

                    background: "rgba(255,255,255,.58)",

                    border:
                      "1px solid rgba(25,52,127,.2)",

                    backdropFilter: "blur(14px)",

                    transition: "all .3s ease",

                    "&:hover": {
                      transform: "translateY(-4px)",
                      background:
                        "rgba(255,255,255,.85)",
                    },
                  }}
                >
                  Become a Driver
                </Button>
              </Stack>

              {/* Features */}

              <Stack
                direction="row"
                sx={{
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: {
                    xs: "center",
                    md: "flex-start",
                  },
                  mt: 0.5,
                }}
              >
                {[
                  {
                    icon: <VerifiedUserOutlinedIcon />,
                    text: "Verified Drivers",
                  },
                  {
                    icon: <LockOutlinedIcon />,
                    text: "Secure Payments",
                  },
                  {
                    icon: <StarRoundedIcon />,
                    text: "4.9/5 Ratings",
                  },
                ].map((item) => (
                  <Box
                    className="hero-feature"
                    key={item.text}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      px: 1.4,
                      py: 0.9,
                      borderRadius: 0,
                      background:
                        "rgba(255,255,255,.52)",
                      border:
                        "1px solid rgba(255,255,255,.7)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <Box
                      sx={{
                        color: "#2952CC",
                        display: "flex",

                        "& svg": {
                          fontSize: 18,
                        },
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: ".72rem",
                        fontWeight: 700,
                        color: "#26344A",
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>

            {/* ==================================================
                ROUTE VISUAL
            ================================================== */}

            <Box
              ref={heroVisualRef}
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Box
                className="route-card"
                sx={{
                  width: {
                    md: 340,
                    lg: 390,
                  },
                  minHeight: 420,
                  p: 3,
                  borderRadius: 0,

                  background:
                    "rgba(255,255,255,.58)",

                  border:
                    "1px solid rgba(255,255,255,.8)",

                  backdropFilter: "blur(24px)",

                  boxShadow:
                    "0 35px 90px rgba(18,36,76,.17)",
                }}
              >
                <Stack
                  sx={{
                    height: "100%",
                    minHeight: 360,
                    justifyContent: "space-between",
                  }}
                >
                  {/* Header */}

                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 950,
                        fontSize: "1.15rem",
                        color: "#12213B",
                      }}
                    >
                      Your Journey
                    </Typography>

                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 0,
                        background:
                          "rgba(41,82,204,.1)",
                        color: "#2952CC",
                      }}
                    >
                      <LocationOnOutlinedIcon />
                    </Box>
                  </Stack>

                  {/* Route */}

                  <Box>
                    <Stack
                      sx={{
                        position: "relative",
                        gap: 4,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: 17,
                          top: 25,
                          bottom: 25,
                          width: 2,

                          background:
                            "linear-gradient(#2952CC,#E32636)",
                        }}
                      />

                      {[
                        {
                          city: "Johannesburg",
                          label: "Departure",
                          color: "#2952CC",
                        },
                        {
                          city: "Durban",
                          label: "Destination",
                          color: "#E32636",
                        },
                      ].map((stop) => (
                        <Stack
                          key={stop.city}
                          direction="row"
                          sx={{
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              flexShrink: 0,
                              zIndex: 2,

                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",

                              borderRadius: 0,

                              background:
                                stop.color,

                              boxShadow:
                                `0 8px 20px ${stop.color}45`,
                            }}
                          >
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: 0,
                                background: "#fff",
                              }}
                            />
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                fontSize: ".65rem",
                                textTransform:
                                  "uppercase",
                                fontWeight: 700,
                                color:
                                  "rgba(18,33,59,.5)",
                              }}
                            >
                              {stop.label}
                            </Typography>

                            <Typography
                              sx={{
                                fontWeight: 900,
                                color: "#12213B",
                                fontSize: "1.05rem",
                              }}
                            >
                              {stop.city}
                            </Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  {/* Availability */}

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      background:
                        "rgba(255,255,255,.62)",
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: ".65rem",
                            color:
                              "rgba(18,33,59,.5)",
                            fontWeight: 700,
                          }}
                        >
                          RIDES AVAILABLE
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "1.6rem",
                            fontWeight: 950,
                            color: "#12213B",
                          }}
                        >
                          24
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.7,
                          borderRadius: 0,
                          background:
                            "rgba(41,82,204,.1)",
                          color: "#2952CC",
                          fontSize: ".7rem",
                          fontWeight: 800,
                        }}
                      >
                        Live
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ========================================================
          HOW IT WORKS
      ======================================================== */}

      <Box
        id="how-it-works"
        component="section"
        sx={{
          py: {
            xs: 9,
            md: 14,
          },
          background: "#fff",
          scrollMarginTop: 90,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            className="reveal-section"
            sx={{
              alignItems: "center",
              textAlign: "center",
              gap: 1.5,
              mb: 7,
            }}
          >
            <Typography
              sx={{
                color: "#2952CC",
                fontSize: ".75rem",
                fontWeight: 900,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Simple by design
            </Typography>

            <Typography
              component="h2"
              sx={{
                fontWeight: 950,
                color: "#0B172A",
                fontSize: {
                  xs: "2.1rem",
                  md: "3.5rem",
                },
                letterSpacing: "-2px",
              }}
            >
              Travel without
              <br />
              the complication.
            </Typography>

            <Typography
              sx={{
                maxWidth: 600,
                color: "rgba(20,35,55,.62)",
                lineHeight: 1.7,
              }}
            >
              ReaGae connects people travelling in the same
              direction, making long-distance journeys easier
              to plan and share.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3,1fr)",
              },
              gap: 2,
            }}
          >
            {[
              {
                number: "01",
                icon: <SearchIcon />,
                title: "Find your route",
                text:
                  "Choose where you're going and discover available rides heading your way.",
              },
              {
                number: "02",
                icon: <PeopleAltOutlinedIcon />,
                title: "Connect",
                text:
                  "Choose a suitable ride and connect with a verified driver.",
              },
              {
                number: "03",
                icon: <HandshakeOutlinedIcon />,
                title: "Travel together",
                text:
                  "Meet up, share the journey and get where you're going.",
              },
            ].map((item) => (
              <Box
                key={item.number}
                className="feature-card"
                sx={{
                  position: "relative",
                  p: 3.5,
                  minHeight: 260,
                  borderRadius: 0,
                  background: "#F7F9FC",
                  border: "1px solid #E8EDF5",
                  transition: "all .3s ease",

                  "&:hover": {
                    transform: "translateY(-7px)",
                    boxShadow:
                      "0 25px 50px rgba(20,35,70,.09)",
                    background: "#fff",
                  },
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 25,
                    right: 28,
                    fontWeight: 950,
                    color:
                      "rgba(41,82,204,.08)",
                    fontSize: "3.5rem",
                  }}
                >
                  {item.number}
                </Typography>

                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 0,
                    color: "#2952CC",
                    background:
                      "rgba(41,82,204,.09)",
                    mb: 4,
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.15rem",
                    color: "#13223A",
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  sx={{
                    color:
                      "rgba(20,35,55,.58)",
                    fontSize: ".9rem",
                    lineHeight: 1.7,
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ========================================================
          FIND A RIDE (section id="rides" to match short page)
      ======================================================== */}

      <Box
        id="rides"
        component="section"
        sx={{
          py: {
            xs: 9,
            md: 14,
          },
          background:
            "linear-gradient(135deg,#F4F7FF,#FFFFFF)",
          scrollMarginTop: 90,
        }}
      >
        <Container maxWidth="lg">
          <Box
            className="reveal-section"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 6,
              alignItems: "center",
            }}
          >
            <Stack sx={{ gap: 2.5 }}>
              <Typography
                sx={{
                  color: "#2952CC",
                  fontWeight: 900,
                  fontSize: ".75rem",
                  letterSpacing: "1.4px",
                }}
              >
                FIND A RIDE
              </Typography>

              <Typography
                component="h2"
                sx={{
                  fontWeight: 950,
                  fontSize: {
                    xs: "2.2rem",
                    md: "3.5rem",
                  },
                  lineHeight: 1.05,
                  letterSpacing: "-2px",
                  color: "#0B172A",
                }}
              >
                Your destination
                <br />
                is closer than
                <br />
                you think.
              </Typography>

              <Typography
                sx={{
                  color:
                    "rgba(20,35,55,.62)",
                  lineHeight: 1.75,
                  maxWidth: 500,
                }}
              >
                Search available long-distance rides,
                compare your options and choose a journey
                that works for you.
              </Typography>

              {/* EXPLORE RIDES */}

              <Button
                component={Link}
                href="/rider/rides"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                sx={{
                  alignSelf: {
                    xs: "stretch",
                    sm: "flex-start",
                  },
                  px: 3,
                  py: 1.5,
                  borderRadius: 0,
                  background: "#19347F",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 800,

                  "&:hover": {
                    background: "#2952CC",
                    transform: "translateY(-3px)",
                  },

                  transition:
                    "all .25s ease",
                }}
              >
                Explore Rides
              </Button>
            </Stack>

            {/* Ride Preview */}

            <Box
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRadius: 0,
                background:
                  "rgba(255,255,255,.75)",
                border:
                  "1px solid #E7ECF5",
                boxShadow:
                  "0 25px 70px rgba(20,35,70,.08)",
              }}
            >
              <Stack sx={{ gap: 1.2 }}>
                {[
                  {
                    from: "Johannesburg",
                    to: "Durban",
                    seats: 3,
                  },
                  {
                    from: "Pretoria",
                    to: "Polokwane",
                    seats: 2,
                  },
                  {
                    from: "Johannesburg",
                    to: "Bloemfontein",
                    seats: 1,
                  },
                ].map((ride) => (
                  <Box
                    key={`${ride.from}-${ride.to}`}
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      background: "#F8FAFD",
                      border:
                        "1px solid #EDF0F5",
                      transition:
                        "all .25s ease",

                      "&:hover": {
                        transform:
                          "translateX(5px)",
                        background: "#fff",
                        boxShadow:
                          "0 12px 30px rgba(20,35,70,.07)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          alignItems:
                            "center",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            borderRadius: 0,
                            background:
                              "rgba(41,82,204,.1)",
                            color:
                              "#2952CC",
                          }}
                        >
                          <DirectionsCarFilledOutlinedIcon />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 850,
                              fontSize:
                                ".9rem",
                            }}
                          >
                            {ride.from}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                "rgba(20,35,55,.45)",
                              fontSize:
                                ".75rem",
                            }}
                          >
                            → {ride.to}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: ".72rem",
                          color: "#1E7A55",
                        }}
                      >
                        {ride.seats} seats
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ========================================================
          DRIVE WITH US (section id="drivers" to match short page)
      ======================================================== */}

      <Box
        id="drivers"
        component="section"
        sx={{
          py: {
            xs: 9,
            md: 14,
          },
          background: "#fff",
          scrollMarginTop: 90,
        }}
      >
        <Container maxWidth="lg">
          <Box
            className="reveal-section"
            sx={{
              position: "relative",
              overflow: "hidden",
              p: {
                xs: 4,
                md: 7,
              },
              borderRadius: 0,
              background:
                "linear-gradient(135deg,#101D38,#172E63)",
              color: "#fff",
            }}
          >
            {/* Glow */}

            <Box
              sx={{
                position: "absolute",
                width: 350,
                height: 350,
                right: -100,
                top: -130,
                borderRadius: 0,
                background:
                  "radial-gradient(circle,rgba(227,38,54,.25),transparent 70%)",
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                maxWidth: 700,
              }}
            >
              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,.65)",
                  fontWeight: 800,
                  fontSize: ".75rem",
                  letterSpacing: "1.5px",
                  mb: 1.5,
                }}
              >
                DRIVE WITH US
              </Typography>

              <Typography
                component="h2"
                sx={{
                  fontWeight: 950,
                  fontSize: {
                    xs: "2.2rem",
                    md: "3.8rem",
                  },
                  lineHeight: 1.02,
                  letterSpacing: "-2px",
                  mb: 2,
                }}
              >
                Got an empty
                <br />
                seat?
                <br />
                Make it count.
              </Typography>

              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,.62)",
                  lineHeight: 1.75,
                  maxWidth: 570,
                  mb: 3.5,
                }}
              >
                Turn your available seats into an opportunity.
                Connect with people going the same way and
                make your journey more worthwhile.
              </Typography>

              {/* BECOME A DRIVER */}

              <Button
                component={Link}
                href="/register?role=DRIVER"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 0,
                  color: "#101D38",
                  background: "#fff",
                  textTransform: "none",
                  fontWeight: 850,

                  "&:hover": {
                    background: "#F2F5FA",
                    transform:
                      "translateY(-3px)",
                  },

                  transition:
                    "all .25s ease",
                }}
              >
                Become a Driver
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ========================================================
          ABOUT
      ======================================================== */}

      <Box
        id="about"
        component="section"
        sx={{
          py: {
            xs: 9,
            md: 14,
          },
          background: "#F7F9FC",
          scrollMarginTop: 90,
        }}
      >
        <Container maxWidth="lg">
          <Box
            className="reveal-section"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 7,
              alignItems: "center",
            }}
          >
            <Stack sx={{ gap: 2 }}>
              <Typography
                sx={{
                  color: "#2952CC",
                  fontWeight: 900,
                  fontSize: ".75rem",
                  letterSpacing: "1.5px",
                }}
              >
                ABOUT REAGAE
              </Typography>

              <Typography
                component="h2"
                sx={{
                  fontWeight: 950,
                  fontSize: {
                    xs: "2.2rem",
                    md: "3.6rem",
                  },
                  color: "#0B172A",
                  lineHeight: 1.05,
                  letterSpacing: "-2px",
                }}
              >
                More than a ride.
                <br />
                It's the journey.
              </Typography>

              <Typography
                sx={{
                  color:
                    "rgba(20,35,55,.62)",
                  lineHeight: 1.8,
                  maxWidth: 550,
                }}
              >
                ReaGae is built around a simple idea:
                long-distance travel should feel less
                complicated and more connected.
              </Typography>
            </Stack>

            {/* About Features */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 1.5,
              }}
            >
              {[
                {
                  icon: <SecurityOutlinedIcon />,
                  title: "Safety",
                  text: "Trust-focused journeys",
                },
                {
                  icon: <PaymentsOutlinedIcon />,
                  title: "Value",
                  text: "Affordable travel",
                },
                {
                  icon: <PeopleAltOutlinedIcon />,
                  title: "Community",
                  text: "People going your way",
                },
                {
                  icon: <LocationOnOutlinedIcon />,
                  title: "Freedom",
                  text: "Travel your route",
                },
              ].map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    p: 2.5,
                    minHeight: 160,
                    borderRadius: 0,
                    background: "#fff",
                    border:
                      "1px solid #E7ECF4",
                    transition:
                      "all .3s ease",

                    "&:hover": {
                      transform:
                        "translateY(-5px)",
                      boxShadow:
                        "0 20px 40px rgba(20,35,70,.07)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: "#2952CC",
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 850,
                      color: "#15233A",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: ".75rem",
                      color:
                        "rgba(20,35,55,.5)",
                      mt: 0.5,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Page;