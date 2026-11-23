import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

type Props = { title: string; body: string; action: string; href: string };

/** One explicit subject, one action, never a centre credential. */
export function NotificationEmail({ title, body, action, href }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{body}</Preview>
      <Body
        style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff" }}
      >
        <Container style={{ maxWidth: 480, padding: 24 }}>
          <Heading style={{ fontSize: 20 }}>{title}</Heading>
          <Text>{body}</Text>
          <Button
            href={href}
            style={{
              backgroundColor: "#111827",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {action}
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
