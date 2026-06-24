import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Heading, Icon,
  Button, IconButton, Input, InputGroup, InputLeftElement, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tag, Code, Spinner,
} from '@chakra-ui/react';
import {
  FiSearch, FiCpu, FiCopy, FiInfo, FiCheckCircle, FiAlertCircle, FiClock,
  FiPackage, FiKey, FiShield, FiActivity,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { searchDevices } from '../actions/provisioningActions';

const MotionBox = motion(Box);

const STATUS_TONE = {
  verified:    { color: 'green',  label: 'Verified',    icon: FiCheckCircle },
  provisioned: { color: 'cyan',   label: 'Prepared',    icon: FiCheckCircle },
  reserved:    { color: 'purple', label: 'Reserved',    icon: FiClock },
  burning:     { color: 'orange', label: 'Burning',     icon: FiClock },
  failed:      { color: 'red',    label: 'Failed',      icon: FiAlertCircle },
  allocated:   { color: 'gray',   label: 'Allocated',   icon: FiClock },
  pending:     { color: 'gray',   label: 'Pending',     icon: FiClock },
};

const fmtTs  = (t) => (t ? new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const fmtMac = (h) => !h ? '—' : (h.length === 12 ? [0,2,4,6,8,10].map(i => h.slice(i,i+2)).join(':').toUpperCase() : h);
const trunc  = (s, n = 16) => (s && s.length > n ? `${s.slice(0, n / 2)}…${s.slice(-n / 2)}` : (s || '—'));

const Card = (props) => (
  <Box bg="surface.panel" border="1px solid" borderColor="surface.border"
       borderRadius="xl" boxShadow="panel" {...props} />
);

function StatusPill({ status }) {
  const meta = STATUS_TONE[status] || { color: 'gray', label: status || 'unknown', icon: FiClock };
  return (
    <HStack px={2.5} py={1} bg={`${meta.color}.50`} borderRadius="full"
      border="1px solid" borderColor={`${meta.color}.200`} spacing={1.5} display="inline-flex">
      <Icon as={meta.icon} color={`${meta.color}.600`} boxSize={3} />
      <Text fontSize="xs" fontWeight={600} color={`${meta.color}.700`}>{meta.label}</Text>
    </HStack>
  );
}

function KV({ k, v, copyable, mono = true }) {
  const empty = v == null || v === '';
  return (
    <Flex gap={3} fontSize="xs" align="start" wrap="wrap" py={1.5}
          borderBottom="1px dashed" borderColor="surface.border">
      <Text minW="160px" color="surface.subtle" fontWeight={500}>{k}</Text>
      <Box flex={1} minW={0}>
        {empty ? (
          <Text color="surface.subtle">—</Text>
        ) : (
          <HStack spacing={2} align="start">
            {mono ? (
              <Code fontSize="xs" wordBreak="break-all" whiteSpace="normal"
                    color="surface.strong" bg="surface.panelAlt" borderColor="surface.border">
                {String(v)}
              </Code>
            ) : (
              <Text fontSize="xs" color="surface.strong">{String(v)}</Text>
            )}
            {copyable && (
              <Tooltip label="Copy">
                <IconButton aria-label="copy" size="2xs" variant="ghost" icon={<FiCopy />}
                  onClick={() => navigator.clipboard?.writeText(String(v))} />
              </Tooltip>
            )}
          </HStack>
        )}
      </Box>
    </Flex>
  );
}

function SectionHeading({ icon, children }) {
  return (
    <HStack mb={2}>
      {icon && <Icon as={icon} color="brand.600" boxSize={3.5} />}
      <Text fontSize="2xs" color="surface.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight={700}>
        {children}
      </Text>
    </HStack>
  );
}

export default function DevicesPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [detail, setDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounced search — 350 ms after last keystroke
  useEffect(() => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      const r = await searchDevices(q.trim(), 100);
      setResults(r?.devices || []);
      setSearched(true);
      setLoading(false);
    }, 350);
    return () => clearTimeout(id);
  }, [q]);

  const openDetail = (d) => { setDetail(d); setModalOpen(true); };

  const groupedByBatch = useMemo(() => {
    const m = new Map();
    for (const d of results) {
      const k = d.batchId || '—';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(d);
    }
    return Array.from(m.entries());
  }, [results]);

  return (
    <Box p={{ base: 4, lg: 8 }} maxW="1400px" mx="auto">
      {/* Hero */}
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} mb={6}>
        <HStack spacing={2} mb={2}>
          <Box w="6px" h="6px" borderRadius="full" bg="semantic.success" />
          <Text fontSize="xs" color="brand.700" textTransform="uppercase" letterSpacing="0.18em" fontWeight={700}>
            Devices
          </Text>
        </HStack>
        <Heading size="xl" letterSpacing="-0.03em">Find a device</Heading>
        <Text color="surface.muted" mt={1} fontSize="sm">
          Search across every batch by Device ID, MAC address, certificate hash, or cert serial.
        </Text>
      </MotionBox>

      {/* Search */}
      <Card p={5} mb={6}>
        <InputGroup size="lg">
          <InputLeftElement><Icon as={FiSearch} color="surface.subtle" /></InputLeftElement>
          <Input
            autoFocus
            placeholder="ATPL-900042 · 80:77:86:50:00:01 · cert hash prefix · cert serial…"
            value={q} onChange={(e) => setQ(e.target.value)}
            fontFamily="mono"
            fontSize="md"
          />
        </InputGroup>
        <HStack mt={3} spacing={2} flexWrap="wrap">
          <Text fontSize="xs" color="surface.subtle">Examples:</Text>
          {['ATPL-900042', '807786500001', 'kushal', 'verified'].map((ex) => (
            <Tag key={ex} size="sm" variant="subtle" colorScheme="gray" cursor="pointer"
                 onClick={() => setQ(ex)} _hover={{ bg: 'surface.hover' }}>
              {ex}
            </Tag>
          ))}
        </HStack>
      </Card>

      {/* Results */}
      {loading ? (
        <Flex py={20} justify="center"><Spinner size="lg" color="brand.600" thickness="3px" /></Flex>
      ) : !searched ? (
        <Card p={12}>
          <VStack spacing={3}>
            <Box w="64px" h="64px" borderRadius="2xl" bg="brand.50" color="brand.600"
                 display="flex" alignItems="center" justifyContent="center"
                 border="1px solid" borderColor="brand.100">
              <Icon as={FiCpu} boxSize={7} />
            </Box>
            <Heading size="md">Start typing</Heading>
            <Text color="surface.muted" fontSize="sm" textAlign="center" maxW="md">
              Search the entire device fleet — every batch, every verified device, every audit
              record. Click any result to see its full audit trail.
            </Text>
          </VStack>
        </Card>
      ) : results.length === 0 ? (
        <Card p={12}>
          <VStack spacing={3}>
            <Icon as={FiSearch} boxSize={7} color="surface.subtle" />
            <Heading size="md">No matches</Heading>
            <Text color="surface.muted" fontSize="sm">
              Nothing matched "{q}". Try a partial Device ID, MAC, or cert hash prefix.
            </Text>
          </VStack>
        </Card>
      ) : (
        <Card>
          <Flex p={4} borderBottom="1px solid" borderColor="surface.border" align="center">
            <Heading size="xs" textTransform="uppercase" letterSpacing="0.06em" color="surface.muted">
              {results.length} match{results.length === 1 ? '' : 'es'} across {groupedByBatch.length} batch{groupedByBatch.length === 1 ? '' : 'es'}
            </Heading>
          </Flex>
          <TableContainer maxH="640px" overflowY="auto">
            <Table size="sm" variant="simple">
              <Thead bg="surface.panelAlt" position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th>Device ID</Th>
                  <Th>Batch (IWON)</Th>
                  <Th>SKU / Family</Th>
                  <Th>MAC</Th>
                  <Th>Cert hash</Th>
                  <Th>Status</Th>
                  <Th>Verified at</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {results.map((d) => (
                  <Tr key={d._id || d.deviceId}
                      _hover={{ bg: 'surface.hover', cursor: 'pointer' }}
                      onClick={() => openDetail(d)}>
                    <Td>
                      <HStack spacing={1}>
                        <Code fontSize="2xs" colorScheme={d.status === 'failed' ? 'red' : 'brand'}>{d.deviceId}</Code>
                        <IconButton aria-label="copy" size="2xs" variant="ghost" icon={<FiCopy />}
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(d.deviceId); }} />
                      </HStack>
                    </Td>
                    <Td>
                      {d.batchId
                        ? <Code fontSize="2xs" colorScheme="gray">{d.batchId}</Code>
                        : <Text fontSize="xs" color="surface.subtle">—</Text>}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="2xs" color="surface.muted">{d.batch?.productModel || d.productModel}</Text>
                        {(d.batch?.family || d.family) && (
                          <Tag size="sm" colorScheme="brand" variant="subtle">{d.batch?.family || d.family}</Tag>
                        )}
                      </VStack>
                    </Td>
                    <Td><Text fontSize="2xs" fontFamily="mono" color="surface.muted">{fmtMac(d.metadata?.macAddress)}</Text></Td>
                    <Td>
                      <Tooltip label={d.certHash || 'no hash'}>
                        <Code fontSize="2xs" colorScheme="green">{trunc(d.certHash, 14)}</Code>
                      </Tooltip>
                    </Td>
                    <Td><StatusPill status={d.status} /></Td>
                    <Td><Text fontSize="xs" color="surface.subtle">{fmtTs(d.verifiedAt)}</Text></Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <Tooltip label="Audit trail">
                        <IconButton aria-label="audit" size="xs" variant="ghost"
                          icon={<FiInfo />} onClick={() => openDetail(d)} />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ── Device Audit Modal ─────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="3xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader pb={3} borderBottom="1px solid" borderColor="surface.border">
            {detail && (
              <VStack align="start" spacing={1.5}>
                <HStack spacing={2}>
                  <Box w="32px" h="32px" borderRadius="md" bg="brand.50" color="brand.600"
                       border="1px solid" borderColor="brand.100"
                       display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiInfo} boxSize={4} />
                  </Box>
                  <Heading size="sm">Device audit trail</Heading>
                </HStack>
                <HStack>
                  <Code fontSize="md" colorScheme="brand">{detail.deviceId}</Code>
                  <StatusPill status={detail.status} />
                </HStack>
              </VStack>
            )}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={5}>
            {detail && (
              <VStack align="stretch" spacing={6}>
                <Box>
                  <SectionHeading icon={FiCpu}>Identity</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="Device ID"     v={detail.deviceId}     copyable />
                    <KV k="Batch (IWON)"  v={detail.batchId}      copyable />
                    <KV k="Serial number" v={detail.serialNumber} mono={false} />
                    <KV k="Family"        v={detail.family}       mono={false} />
                    <KV k="Family code"   v={detail.familyCode}   mono={false} />
                    <KV k="Product Model" v={detail.productModel} mono={false} />
                    <KV k="Firmware"      v={detail.batch?.firmwareVersion} mono={false} />
                  </Box>
                </Box>

                <Box>
                  <SectionHeading icon={FiKey}>OTP / eFuse</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="OTP encoded"  v={detail.otpEncoded} copyable />
                    <KV k="OTP readback" v={detail.metadata?.otpReadback} copyable />
                  </Box>
                </Box>

                <Box>
                  <SectionHeading icon={FiShield}>Certificate</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="Cert hash (SHA-256)" v={detail.certHash}        copyable />
                    <KV k="Cert serial #"       v={detail.certSerial}      copyable />
                    <KV k="Cert fingerprint"    v={detail.certFingerprint} copyable />
                    <KV k="GCP CAS resource"    v={detail.certGcpName}     copyable />
                    <KV k="Algorithm"           v={detail.certAlgorithm || 'EC_SIGN_P256_SHA256'} mono={false} />
                    <KV k="Not before"          v={fmtTs(detail.certNotBefore)} mono={false} />
                    <KV k="Not after"           v={fmtTs(detail.certNotAfter)}  mono={false} />
                  </Box>
                </Box>

                <Box>
                  <SectionHeading icon={FiActivity}>Burn / verification</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="Status"        v={detail.status} mono={false} />
                    <KV k="Burned at"     v={fmtTs(detail.burnedAt)}   mono={false} />
                    <KV k="Verified at"   v={fmtTs(detail.verifiedAt)} mono={false} />
                    <KV k="Station"       v={detail.metadata?.station} />
                    <KV k="Jig slot"      v={detail.metadata?.jigSlot} mono={false} />
                    <KV k="MAC (assigned)" v={fmtMac(detail.metadata?.macAddress)} copyable />
                  </Box>
                </Box>

                {detail.tests && (
                  <Box>
                    <SectionHeading icon={FiCheckCircle}>Test results</SectionHeading>
                    <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                      {Object.entries(detail.tests).map(([k, v]) => {
                        const tone = v === 'pass' ? 'green' : v === 'fail' ? 'red' : 'gray';
                        return (
                          <Flex key={k} justify="space-between" align="center" py={1.5}
                                borderBottom="1px dashed" borderColor="surface.border">
                            <Text fontSize="xs" color="surface.muted">{k}</Text>
                            <Tag size="sm" colorScheme={tone} variant="subtle" minW="56px" justifyContent="center">
                              {v || '—'}
                            </Tag>
                          </Flex>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                <Box>
                  <SectionHeading icon={FiInfo}>Raw record (audit JSON)</SectionHeading>
                  <Box bg="#0F1525" color="#E5E7EB" border="1px solid" borderColor="surface.border"
                       borderRadius="lg" p={3} maxH="300px" overflowY="auto">
                    <Code as="pre" fontSize="2xs" bg="transparent" color="inherit" border="none"
                          whiteSpace="pre-wrap" wordBreak="break-all" display="block">
                      {JSON.stringify(detail, null, 2)}
                    </Code>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="surface.border">
            <Button variant="ghost" mr={3} onClick={() => setModalOpen(false)}>Close</Button>
            {detail && (
              <Button leftIcon={<FiCopy />} onClick={() =>
                navigator.clipboard?.writeText(JSON.stringify(detail, null, 2))
              }>
                Copy JSON
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
