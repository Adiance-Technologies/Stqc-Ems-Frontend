import React, { useState, useMemo } from 'react';
import {
  Box, Flex, Heading, Text, HStack, VStack, Icon, Code,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  SimpleGrid, Tag, Button, Input, InputGroup, InputRightElement,
  IconButton, Tooltip, Divider, useToast,
} from '@chakra-ui/react';
import {
  FiShield, FiLock, FiCpu, FiKey, FiCheckCircle, FiAlertTriangle,
  FiCopy, FiExternalLink, FiArrowDown, FiInfo,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const FAMILY_NAMES = { 0: 'SECOS', 1: 'AUGEN', 2: '4GBDP', 3: 'WFBDP' };

function decodeDeviceId(hexStr) {
  const cleaned = hexStr.replace(/^0x/i, '');
  const val = parseInt(cleaned, 16);
  if (Number.isNaN(val)) return null;
  const familyCode = val & 0xF;
  const serial = (val >>> 4) & 0xFFFFF;
  const family = FAMILY_NAMES[familyCode] || `UNKNOWN(${familyCode})`;
  return { serial, familyCode, family, hex: '0x' + val.toString(16).toUpperCase().padStart(8, '0'),
           deviceId: `ATPL-${String(serial).padStart(6, '0')}-${family}` };
}
function encodeDeviceId(deviceIdStr) {
  const match = deviceIdStr.match(/^ATPL-(\d+)-(\w+)$/);
  if (!match) return null;
  const serial = parseInt(match[1]);
  const familyName = match[2];
  const familyCode = Object.entries(FAMILY_NAMES).find(([, v]) => v === familyName)?.[0];
  if (familyCode === undefined || serial > 0xFFFFF) return null;
  const val = ((serial & 0xFFFFF) << 4) | (parseInt(familyCode) & 0xF);
  return { serial, familyCode: parseInt(familyCode), family: familyName,
           hex: '0x' + val.toString(16).toUpperCase().padStart(8, '0'), deviceId: deviceIdStr };
}

const Card = (props) => (
  <Box bg="surface.panel" border="1px solid" borderColor="surface.border"
       borderRadius="xl" boxShadow="panel" {...props} />
);

// One CA layer in the chain
function ChainLayer({ tone, indent, title, subtitle, fields, status }) {
  return (
    <Box ml={`${indent * 32}px`} position="relative">
      <Box
        bg="surface.panel" border="1px solid" borderColor="surface.border"
        borderRadius="xl" p={5} boxShadow="panel"
        _before={{
          content: '""',
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
          bg: `${tone}.500`, borderTopLeftRadius: 'xl', borderBottomLeftRadius: 'xl',
        }}
      >
        <Flex justify="space-between" align="start" mb={3}>
          <HStack spacing={3} align="start">
            <Box w="40px" h="40px" borderRadius="lg" bg={`${tone}.50`} color={`${tone}.600`}
                 border="1px solid" borderColor={`${tone}.100`}
                 display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Icon as={FiShield} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight={700} color="surface.strong">{title}</Text>
              <Text fontSize="xs" color="surface.muted">{subtitle}</Text>
            </Box>
          </HStack>
          {status}
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={2} mt={2}>
          {fields.map(([k, v, mono]) => (
            <Flex key={k} justify="space-between" gap={3} fontSize="xs">
              <Text color="surface.subtle" minW="80px">{k}</Text>
              <Text color="surface.muted" fontFamily={mono ? 'mono' : undefined} textAlign="right" isTruncated>{v}</Text>
            </Flex>
          ))}
        </SimpleGrid>
      </Box>
      {indent < 3 && (
        <Box ml={4} my={1} display="flex" alignItems="center" justifyContent="flex-start">
          <Icon as={FiArrowDown} color="surface.borderHi" />
        </Box>
      )}
    </Box>
  );
}

function StatBox({ label, value, sub, tone, icon }) {
  return (
    <Card p={5}>
      <Flex align="center" justify="space-between" mb={3}>
        <Box w="36px" h="36px" borderRadius="lg" bg={`${tone}.50`} color={`${tone}.600`}
             border="1px solid" borderColor={`${tone}.100`}
             display="flex" alignItems="center" justifyContent="center">
          <Icon as={icon} boxSize={4} />
        </Box>
      </Flex>
      <Text fontSize="xs" color="surface.muted" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600}>{label}</Text>
      <Text fontSize="xl" fontWeight={700} color={`${tone}.700`} mt={1} letterSpacing="-0.025em">{value}</Text>
      {sub && <Text fontSize="xs" color="surface.subtle" mt={1}>{sub}</Text>}
    </Card>
  );
}

export default function CertificatesPage() {
  const toast = useToast();
  const [otpInput, setOtpInput] = useState('');
  const [otpResult, setOtpResult] = useState(null);

  const handleDecode = () => {
    if (!otpInput.trim()) return;
    const clean = otpInput.trim().replace(/^0x/i, '');
    let r = decodeDeviceId(clean);
    if (!r) r = encodeDeviceId(otpInput.trim());
    setOtpResult(r);
    if (!r) toast({ status: 'error', title: 'Invalid input', description: 'Enter ATPL-NNNNNN-FAMILY or 0xNNNNNNNN' });
  };

  const copy = (txt, label) => {
    navigator.clipboard.writeText(txt);
    toast({ status: 'success', title: `${label || 'Copied'}`, duration: 1500 });
  };

  const caHashWords = ['0x44EAC147', '0x53385146', '0x971F2BC3'];
  const today = new Date();
  const wildcardExp = new Date('2026-05-17');
  const wildcardDays = Math.ceil((wildcardExp - today) / (1000 * 60 * 60 * 24));

  return (
    <Box p={{ base: 4, lg: 8 }} maxW="1400px" mx="auto">
      {/* Hero */}
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} mb={6}>
        <HStack spacing={2} mb={2}>
          <Box w="6px" h="6px" borderRadius="full" bg="semantic.success" />
          <Text fontSize="xs" color="brand.700" textTransform="uppercase" letterSpacing="0.18em" fontWeight={700}>
            Certificates & PKI
          </Text>
        </HStack>
        <Heading size="xl" letterSpacing="-0.03em">Trust infrastructure</Heading>
        <Text color="surface.muted" mt={1} fontSize="sm">
          Certificate chain, GCP CAS status, and the OTP / eFuse inspector for device identity verification.
        </Text>
      </MotionBox>

      {/* CA expiry stats */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mb={6}>
        <StatBox label="Root CA" value="2036-02-09" sub="~10 years remaining" tone="green"  icon={FiShield} />
        <StatBox label="Intermediate CA" value="2031-02-10" sub="~5 years remaining" tone="green"  icon={FiKey} />
        <StatBox label="Wildcard"  value="2026-05-17" sub={wildcardDays > 0 ? `${wildcardDays} days — renew soon` : 'EXPIRED'} tone={wildcardDays < 30 ? 'red' : 'yellow'} icon={FiAlertTriangle} />
        <StatBox label="HSM Status" value="Active" sub="GCP KMS · FIPS 140-2 L3" tone="brand"   icon={FiCheckCircle} />
      </SimpleGrid>

      {/* Tabs */}
      <Card>
        <Tabs variant="enclosed-colored" colorScheme="brand">
          <TabList px={4} pt={4} borderBottom="1px solid" borderColor="surface.border">
            <Tab _selected={{ color: 'brand.700', bg: 'brand.50', borderColor: 'surface.border', borderBottomColor: 'transparent' }}>
              <HStack spacing={2}><Icon as={FiShield} /><Text fontWeight={600}>PKI Chain</Text></HStack>
            </Tab>
            <Tab _selected={{ color: 'brand.700', bg: 'brand.50', borderColor: 'surface.border', borderBottomColor: 'transparent' }}>
              <HStack spacing={2}><Icon as={FiLock} /><Text fontWeight={600}>OTP / eFuse</Text></HStack>
            </Tab>
            <Tab _selected={{ color: 'brand.700', bg: 'brand.50', borderColor: 'surface.border', borderBottomColor: 'transparent' }}>
              <HStack spacing={2}><Icon as={FiCpu} /><Text fontWeight={600}>Root CA Hash</Text></HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* ─── Chain ────────────────────────────────── */}
            <TabPanel p={6}>
              <VStack spacing={0} align="stretch">
                <ChainLayer
                  tone="orange" indent={0}
                  title="ArcisAI Root CA HSM"
                  subtitle="Trust anchor — self-signed, HSM-protected"
                  status={<Tag colorScheme="green" variant="subtle"><HStack><Icon as={FiCheckCircle} /><Text>Active</Text></HStack></Tag>}
                  fields={[
                    ['Subject', 'CN=ArcisAI Root CA HSM, O=Adiance, C=IN'],
                    ['Key',     'EC P-256 (secp256r1)'],
                    ['Valid',   '2026-02-11 to 2036-02-09'],
                    ['SHA-256', '44EAC147…F7931647', true],
                  ]}
                />
                <ChainLayer
                  tone="purple" indent={1}
                  title="ArcisAI IoT Intermediate CA HSM"
                  subtitle="Issuing authority — GCP CAS, signs every device cert"
                  status={<Tag colorScheme="green" variant="subtle"><HStack><Icon as={FiCheckCircle} /><Text>Active</Text></HStack></Tag>}
                  fields={[
                    ['Key',     'EC P-256, HSM-backed (FIPS 140-2 L3)'],
                    ['KMS',     'ca-intermediate-key-hsm', true],
                    ['Pool',    'arcisai-iot-ca-pool (asia-south1)', true],
                    ['Valid',   '2026-02-11 to 2031-02-10'],
                  ]}
                />
                <ChainLayer
                  tone="yellow" indent={2}
                  title="*.devices.arcisai.io"
                  subtitle="Server wildcard — used by MQTT broker + HTTPS API"
                  status={<Tag colorScheme={wildcardDays < 30 ? 'red' : 'yellow'} variant="subtle"><HStack><Icon as={FiAlertTriangle} /><Text>{wildcardDays} days</Text></HStack></Tag>}
                  fields={[
                    ['Used by', 'MQTT (8883), HTTPS API'],
                    ['Valid',   '2026-02-16 to 2026-05-17'],
                  ]}
                />
                <ChainLayer
                  tone="brand" indent={3}
                  title="Per-Device Client Certificates"
                  subtitle="One per camera — issued by GCP CAS at batch creation"
                  status={<Tag colorScheme="brand" variant="subtle">365-day validity</Tag>}
                  fields={[
                    ['CN',         '{DEVICE_ID}.devices.arcisai.io', true],
                    ['SAN',        'DNS + URI:urn:arcisai:device:…'],
                    ['Key',        'EC P-256 (generated on-device)'],
                    ['Signed by',  'GCP CAS (HSM key never exported)'],
                  ]}
                />
              </VStack>
            </TabPanel>

            {/* ─── OTP Decoder ─────────────────────────── */}
            <TabPanel p={6}>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="sm" mb={1}>Device ID ↔ OTP encoder</Heading>
                  <Text fontSize="sm" color="surface.muted">
                    Convert between human-readable device IDs and the 32-bit OTP value burned into eFuse word 0.
                  </Text>
                </Box>

                <Card p={5}>
                  <FormLabel fontSize="sm" fontWeight={600}>Input</FormLabel>
                  <InputGroup>
                    <Input value={otpInput} onChange={(e) => setOtpInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDecode()}
                      placeholder="ATPL-900001-SECOS  OR  0x00DBBA10" fontFamily="mono" />
                    <InputRightElement width="auto" pr={1.5}>
                      <Button size="sm" onClick={handleDecode}>Decode</Button>
                    </InputRightElement>
                  </InputGroup>
                  <Text fontSize="xs" color="surface.subtle" mt={1.5}>
                    Layout: <Code fontSize="2xs">reserved(8) | serial(20) | family_code(4)</Code> — little-endian
                  </Text>

                  {otpResult && (
                    <Box mt={5} p={4} bg="brand.50" border="1px solid" borderColor="brand.200" borderRadius="lg">
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        {[
                          ['Device ID',     otpResult.deviceId,     true],
                          ['OTP hex (LE)',  otpResult.hex,          true],
                          ['Serial',        otpResult.serial.toLocaleString(), false],
                          ['Family',        `${otpResult.family} (code ${otpResult.familyCode})`, false],
                        ].map(([k, v, copyable]) => (
                          <Box key={k}>
                            <Text fontSize="2xs" color="brand.700" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700} mb={1}>{k}</Text>
                            <HStack>
                              <Text fontSize="md" fontWeight={700} color="brand.800" fontFamily={copyable ? 'mono' : undefined} isTruncated>{v}</Text>
                              {copyable && (
                                <IconButton size="2xs" variant="ghost" aria-label="copy" icon={<FiCopy />}
                                            onClick={() => copy(String(v), k)} />
                              )}
                            </HStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </Card>

                {/* OTP layout */}
                <Card p={5}>
                  <Heading size="xs" textTransform="uppercase" letterSpacing="0.06em" color="surface.muted" mb={4}>
                    OTP word layout (32 bits, eFuse word 0)
                  </Heading>
                  <Flex gap={0} borderRadius="lg" overflow="hidden" border="1px solid" borderColor="surface.border">
                    <Box flex="0 0 80px" p={3} bg="surface.panelAlt" textAlign="center">
                      <Text fontSize="2xs" color="surface.subtle" textTransform="uppercase" fontWeight={700}>bits 31–24</Text>
                      <Text fontSize="sm" fontWeight={700} color="surface.muted">reserved</Text>
                      <Text fontSize="2xs" color="surface.subtle">8 bits</Text>
                    </Box>
                    <Box flex={1} p={3} bg="brand.50" textAlign="center" borderLeft="1px solid" borderColor="surface.border">
                      <Text fontSize="2xs" color="brand.700" textTransform="uppercase" fontWeight={700}>bits 23–4</Text>
                      <Text fontSize="sm" fontWeight={700} color="brand.700">serial number</Text>
                      <Text fontSize="2xs" color="brand.600">20 bits · 0–1,048,575</Text>
                    </Box>
                    <Box flex="0 0 100px" p={3} bg="green.50" textAlign="center" borderLeft="1px solid" borderColor="surface.border">
                      <Text fontSize="2xs" color="green.700" textTransform="uppercase" fontWeight={700}>bits 3–0</Text>
                      <Text fontSize="sm" fontWeight={700} color="green.700">family</Text>
                      <Text fontSize="2xs" color="green.600">4 bits</Text>
                    </Box>
                  </Flex>
                </Card>
              </VStack>
            </TabPanel>

            {/* ─── Root CA hash ───────────────────────── */}
            <TabPanel p={6}>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="sm" mb={1}>Root CA hash (OTP pin)</Heading>
                  <Text fontSize="sm" color="surface.muted">
                    Truncated SHA-256 of the Root CA DER, burned into eFuse words 1–3. Devices verify
                    every TLS handshake against this — prevents MITM even if a CA below is compromised.
                  </Text>
                </Box>

                <Card p={6} bg="orange.50" borderColor="orange.200">
                  <Heading size="xs" textTransform="uppercase" letterSpacing="0.06em" color="orange.700" mb={3}>
                    Trust anchor — fleet constant
                  </Heading>
                  <Text fontSize="xl" fontWeight={700} color="orange.700" fontFamily="mono" letterSpacing="0.05em" wordBreak="break-all">
                    44EAC14753385146971F2BC3
                  </Text>
                  <Text fontSize="xs" color="orange.600" mt={2}>
                    SHA-256(rootCA.der)[0:12] · 96 bits · little-endian when packed into eFuse
                  </Text>
                </Card>

                <SimpleGrid columns={3} spacing={3}>
                  {caHashWords.map((word, i) => (
                    <Card key={word} p={4} bg="surface.panelAlt">
                      <Text fontSize="2xs" color="surface.subtle" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700} mb={1}>
                        eFuse word {i + 1}
                      </Text>
                      <HStack>
                        <Text fontSize="md" fontWeight={700} fontFamily="mono" color="surface.strong">{word}</Text>
                        <IconButton size="2xs" variant="ghost" aria-label="copy" icon={<FiCopy />}
                                    onClick={() => copy(word, `Word ${i + 1}`)} />
                      </HStack>
                    </Card>
                  ))}
                </SimpleGrid>

                <Card p={5}>
                  <HStack mb={3}>
                    <Icon as={FiInfo} color="brand.600" />
                    <Heading size="sm" color="surface.strong">How devices use it</Heading>
                  </HStack>
                  <VStack spacing={2} align="stretch" fontSize="sm" color="surface.muted">
                    <Text>1. Device boots, establishes mTLS to <Code>*.devices.arcisai.io</Code></Text>
                    <Text>2. Server presents wildcard cert + chain → device verifies signature path to Intermediate CA</Text>
                    <Text>3. Device computes <Code>SHA-256(receivedRootCA.der)[0:12]</Code></Text>
                    <Text>4. Compares against eFuse-burned constant. Mismatch → connection rejected.</Text>
                  </VStack>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
}

function FormLabel({ children, ...p }) {
  return <Text fontSize="sm" color="surface.muted" mb={1.5} fontWeight={600} {...p}>{children}</Text>;
}
