import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

type Props = {
  confirmUrl: string;
  copy: {
    preview: string;
    title: string;
    intro: string;
    data: string;
    confirm: string;
    refuse: string;
    expiry: string;
  };
};

/** One action: confirm. Refusing is a plain link to the same page. No centre credentials, ever. */
export function ConsentEmail({ confirmUrl, copy }: Props) {
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
          <Text>{copy.data}</Text>
          <Button
            href={confirmUrl}
            style={{
              backgroundColor: "#111827",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {copy.confirm}
          </Button>
          <Text>
            <Link href={confirmUrl} style={{ color: "#6b7280" }}>
              {copy.refuse}
            </Link>
          </Text>
          <Text style={{ color: "#6b7280" }}>{copy.expiry}</Text>
        </Container>
      </Body>
    </Html>
  );
}
