import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  code: string;
  copy: {
    preview: string;
    title: string;
    intro: string;
    expiry: string;
    ignore: string;
  };
};

export function OtpEmail({ code, copy }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body
        style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff" }}
      >
        <Container style={{ maxWidth: 480, padding: 24 }}>
          <Heading style={{ fontSize: 20 }}>{copy.title}</Heading>
          <Text>{copy.intro}</Text>
          <Section
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 8,
              padding: "16px 0",
            }}
          >
            {code}
          </Section>
          <Text>{copy.expiry}</Text>
          <Text style={{ color: "#6b7280" }}>{copy.ignore}</Text>
        </Container>
      </Body>
    </Html>
  );
}
