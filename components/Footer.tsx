"use client";

import {
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        {
          y: 35,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: 0.25,
          ease: "power3.out",
        }
      );

      gsap.to(glowRef.current, {
        x: 60,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const links = [
    "Privacy",
    "Terms",
    "Support",
  ];

  const socials = [
    {
      icon: <FacebookIcon />,
      label: "Facebook",
      color: "#1877F2",
    },
    {
      icon: <TwitterIcon />,
      label: "Twitter",
      color: "#1DA1F2",
    },
    {
      icon: <InstagramIcon />,
      label: "Instagram",
      color: "#E4405F",
    },
    {
      icon: <LinkedInIcon />,
      label: "LinkedIn",
      color: "#0A66C2",
    },
    {
      icon: <YouTubeIcon />,
      label: "YouTube",
      color: "#FF0000",
    },
  ];

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box
      ref={footerRef}
      component="footer"
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        background:
          "linear-gradient(135deg, rgba(8,16,31,0.96), rgba(13,25,48,0.96))",
        borderTop:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Ambient glow */}
      <Box
        ref={glowRef}
        sx={{
          position: "absolute",
          width: 380,
          height: 180,
          left: "20%",
          bottom: -130,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(41,82,204,0.18), transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          px: {
            xs: 2.5,
            sm: 4,
            md: 6,
            lg: 8,
          },
        }}
      >
        {/* Main footer */}
        <Box
          sx={{
            py: {
              xs: 3,
              sm: 4,
              md: 4.5,
            },
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            justifyContent:
              "space-between",
            gap: 3,
          }}
        >
          {/* Brand */}
          <Stack
            sx={{
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.25rem",
                },
                fontWeight: 950,
                letterSpacing: "-0.6px",
                color: "#fff",
              }}
            >
              ReaGae
            </Typography>

            <Typography
              sx={{
                maxWidth: 310,
                color:
                  "rgba(255,255,255,0.45)",
                fontSize: {
                  xs: "0.7rem",
                  sm: "0.78rem",
                },
                lineHeight: 1.6,
              }}
            >
              Long-distance travel made
              simpler, safer and more
              connected.
            </Typography>
          </Stack>

          {/* Right */}
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            sx={{
              width: {
                xs: "100%",
                md: "auto",
              },
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              gap: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            {/* Links */}
            <Stack
              direction="row"
              sx={{
                flexWrap: "wrap",
                gap: {
                  xs: 2,
                  sm: 3,
                },
              }}
            >
              {links.map((text) => (
                <Link
                  key={text}
                  href="#"
                  underline="none"
                  sx={{
                    position: "relative",
                    color:
                      "rgba(255,255,255,0.58)",
                    fontSize: {
                      xs: "0.72rem",
                      sm: "0.8rem",
                    },
                    fontWeight: 650,
                    transition:
                      "color .25s ease",
                    "&::after": {
                      content: '""',
                      position:
                        "absolute",
                      left: 0,
                      bottom: -4,
                      width: 0,
                      height: 1,
                      background:
                        "#fff",
                      transition:
                        "width .25s ease",
                    },
                    "&:hover": {
                      color: "#fff",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  {text}
                </Link>
              ))}
            </Stack>

            {/* Separator */}
            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
                width: "1px",
                height: 28,
                background:
                  "rgba(255,255,255,0.1)",
              }}
            />

            {/* Socials */}
            <Stack
              direction="row"
              sx={{
                gap: 0.7,
              }}
            >
              {socials.map(
                ({
                  icon,
                  label,
                  color,
                }) => (
                  <IconButton
                    key={label}
                    href="#"
                    aria-label={label}
                    size="small"
                    sx={{
                      width: {
                        xs: 31,
                        sm: 34,
                      },
                      height: {
                        xs: 31,
                        sm: 34,
                      },
                      color:
                        "rgba(255,255,255,0.45)",
                      background:
                        "rgba(255,255,255,0.045)",
                      border:
                        "1px solid rgba(255,255,255,0.06)",
                      borderRadius:
                        "10px",
                      transition:
                        "all .25s ease",
                      "& svg": {
                        fontSize: {
                          xs: 16,
                          sm: 18,
                        },
                      },
                      "&:hover": {
                        color: "#fff",
                        background:
                          color,
                        borderColor:
                          color,
                        transform:
                          "translateY(-3px)",
                        boxShadow:
                          `0 8px 22px ${color}45`,
                      },
                    }}
                  >
                    {icon}
                  </IconButton>
                )
              )}
            </Stack>
          </Stack>
        </Box>

        <Divider
          sx={{
            borderColor:
              "rgba(255,255,255,0.07)",
          }}
        />

        {/* Bottom bar */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          sx={{
            py: {
              xs: 2,
              sm: 2.3,
            },
            gap: 1.5,
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent:
              "space-between",
          }}
        >
          <Typography
            sx={{
              color:
                "rgba(255,255,255,0.32)",
              fontSize: {
                xs: "0.65rem",
                sm: "0.72rem",
              },
            }}
          >
            © {new Date().getFullYear()}{" "}
            ReaGae. All rights reserved.
          </Typography>

          <IconButton
            onClick={handleScrollTop}
            aria-label="Back to top"
            size="small"
            sx={{
              width: 30,
              height: 30,
              color:
                "rgba(255,255,255,0.45)",
              background:
                "rgba(255,255,255,0.05)",
              border:
                "1px solid rgba(255,255,255,0.07)",
              borderRadius: "9px",
              transition:
                "all .25s ease",
              "&:hover": {
                color: "#fff",
                background:
                  "rgba(255,255,255,0.1)",
                transform:
                  "translateY(-2px)",
              },
            }}
          >
            <ArrowUpwardRoundedIcon
              sx={{ fontSize: 17 }}
            />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
