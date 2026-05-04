import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export const ResetPasswordEmail = ({ name, resetLink }: { name: string; resetLink: string }) => (
  <Html>
    <Head />
    <Preview>Reset your CPGET Password</Preview>
    <Body style={{ backgroundColor: "#f9fafb", padding: "20px" }}>
      <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <Heading style={{ color: "#2563eb", fontSize: "24px" }}>Password Reset Request</Heading>
        <Text>Hi {name},</Text>
        <Text>We received a request to reset your password for your CPGET Classroom account. Click the button below to set a new one:</Text>
        <Section style={{ textAlign: "center", margin: "30px 0" }}>
          <Button href={resetLink} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: "5px", textDecoration: "none" }}>
            Reset Password
          </Button>
        </Section>
        <Text style={{ fontSize: "12px", color: "#6b7280" }}>If you didn't request this, you can ignore this email. The link expires in 1 hour.</Text>
      </Container>
    </Body>
  </Html>
);