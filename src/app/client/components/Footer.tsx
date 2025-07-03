"use client";

const Footer = () => {
  return (
    <div className="mt-16 text-center text-muted-foreground text-sm space-y-1">
      <p>© {new Date().getFullYear()} Leo Photography Studio. Client Portal v1.0</p>
      <p className="text-xs">Powered by AI facial recognition technology</p>
    </div>
  );
};

export default Footer;
