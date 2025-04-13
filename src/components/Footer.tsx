"use client";

import React from "react";
import { FaGithub, FaGlobe } from "react-icons/fa";

const YEAR = new Date().getFullYear();

function SocialLink({
  href,
  icon: Icon,
}: {
  href: string;
  icon: React.ComponentType;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-opacity duration-300 hover:opacity-90"
    >
      <Icon />
    </a>
  );
}

function SocialLinks() {
  return (
    <div className="flex text-lg gap-3.5 float-right transition-opacity duration-300 hover:opacity-90">
      <SocialLink href="https://github.com/NotNalin" icon={FaGithub} />
      <SocialLink href="https://notnal.in" icon={FaGlobe} />
    </div>
  );
}

export default function Footer() {
  return (
    <small className="block lg:mt-24 mt-16">
      <time>© {YEAR}</time>{" "}
      <a className="no-underline" href="#">
        NotNalin
      </a>
      <SocialLinks />
    </small>
  );
}
