import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Flex, HStack, VStack, Heading, Text, Tag, Icon, Code, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, SimpleGrid,
  Input, InputGroup, InputLeftElement, Select, IconButton, Tooltip,
  Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSearch, FiCheckCircle, FiAlertCircle, FiArrowRight, FiRefreshCw, FiClipboard } from 'react-icons/fi';
import { listQcReports, getQcReport } from '../actions/qcActions';

const fmtTs = (t) => (t ? new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');

function StatusTag({ status }) {
  const pass = String(status).toUpperCase() === 'PASS';
  return (
    <Tag size="sm" colorScheme={pass ? 'green' : 'red'} variant="subtle">
      <Icon as={pass ? FiCheckCircle : FiAlertCircle} mr={1} boxSize={3} />{status || '—'}
    </Tag>
  );
}

// Render a flat {key: value} object as tag rows (used for test_results).
function ResultGrid({ obj }) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return <Text fontSize="sm" color="gray.400">—</Text>;
  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
      {entries.map(([k, v]) => {
        const s = String(v).toLowerCase();
        const color = s === 'pass' ? 'green' : s === 'fail' ? 'red' : s.includes('not') || s.includes('fail') ? 'red' : 'gray';
        return (
          <HStack key={k} justify="space-between" px={2} py={1} bg="gray.50" borderRadius="md">
            <Text fontSize="xs" color="gray.600">{k}</Text>
            <Tag size="sm" colorScheme={color} variant="subtle">{String(v)}</Tag>
          </HStack>
        );
      })}
    </SimpleGrid>
  );
}

export default function QCReports() {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pass: 0, fail: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const drawer = useDisclosure();

  const load = async () => {
    setLoading(true);
    const r = await listQcReports();
    if (r?.reports) { setReports(r.reports); setCounts(r.counts || { total: 0, pass: 0, fail: 0 }); }
    setLoading(false);
  };
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => reports.filter((r) => {
    if (statusFilter && String(r.overallStatus).toUpperCase() !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.serialNumber, r.model, r.selectedModel, r.engineerName, r.macAddress]
      .some((v) => (v || '').toLowerCase().includes(q));
  }), [reports, search, statusFilter]);

  const openDetail = async (r) => {
    setSelected(r); setDetail(null); drawer.onOpen();
    const full = await getQcReport(r._id || r.deviceFingerprint);
    if (!full?.message) setDetail(full);
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
        <Box>
          <HStack spacing={2}>
            <Heading size="lg">External QC Reports</Heading>
            <Tag size="sm" colorScheme="purple" variant="subtle" borderRadius="full">EXT QC</Tag>
          </HStack>
          <Text color="gray.500" fontSize="sm">Final functional QC of assembled cameras, pushed by the external QC App over the External QC Report API (mTLS) after provisioning.</Text>
        </Box>
        <IconButton aria-label="refresh" icon={<FiRefreshCw />} onClick={load} />
      </Flex>

      {/* KPI strip */}
      <SimpleGrid columns={3} spacing={3} mb={4}>
        {[
          { l: 'Total tested', n: counts.total, c: 'gray' },
          { l: 'Pass', n: counts.pass, c: 'green' },
          { l: 'Fail', n: counts.fail, c: 'red' },
        ].map((s) => (
          <Box key={s.l} p={4} bg={`${s.c}.50`} border="1px solid" borderColor={`${s.c}.100`} borderRadius="lg">
            <Text fontSize="xs" color={`${s.c}.700`} textTransform="uppercase" fontWeight={700}>{s.l}</Text>
            <Text fontSize="2xl" fontWeight={700} color={`${s.c}.700`}>{s.n}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl">
        <Flex p={4} borderBottom="1px solid" borderColor="gray.100" gap={3} flexWrap="wrap">
          <InputGroup maxW="320px">
            <InputLeftElement><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
            <Input placeholder="Search serial, model, engineer, MAC…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW="160px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
          </Select>
          <Box flex={1} />
          <Text fontSize="xs" color="gray.400" alignSelf="center">{filtered.length} of {reports.length}</Text>
        </Flex>

        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Serial / Device ID</Th><Th>Model</Th><Th>Selected</Th><Th>Engineer</Th>
                <Th>Status</Th><Th>Firmware</Th><Th isNumeric>Attempts</Th><Th>Tested</Th><Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r._id || r.deviceFingerprint} _hover={{ bg: 'gray.50', cursor: 'pointer' }} onClick={() => openDetail(r)}>
                  <Td><Code fontSize="2xs" colorScheme="brand">{r.serialNumber || '—'}</Code></Td>
                  <Td>
                    <Text fontSize="xs">{r.model || '—'}</Text>
                    {r.modelMatch === false && <Tag size="sm" colorScheme="orange" variant="subtle" mt={0.5}>model mismatch</Tag>}
                  </Td>
                  <Td><Text fontSize="xs" color="gray.500">{r.selectedModel || '—'}</Text></Td>
                  <Td><Text fontSize="xs">{r.engineerName || '—'}</Text></Td>
                  <Td><StatusTag status={r.overallStatus} /></Td>
                  <Td><Text fontSize="2xs" fontFamily="mono" color="gray.500">{r.firmwareVersion || '—'}</Text></Td>
                  <Td isNumeric>{r.attempts || 1}</Td>
                  <Td><Text fontSize="xs" color="gray.500">{fmtTs(r.testedAt)}</Text></Td>
                  <Td><IconButton aria-label="view" size="xs" variant="ghost" icon={<FiArrowRight />} onClick={() => openDetail(r)} /></Td>
                </Tr>
              ))}
              {!loading && filtered.length === 0 && (
                <Tr><Td colSpan={9}><Text textAlign="center" py={6} color="gray.400">No QC reports yet.</Text></Td></Tr>
              )}
              {loading && (
                <Tr><Td colSpan={9}><Flex justify="center" py={6}><Spinner /></Flex></Td></Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Detail drawer */}
      <Drawer isOpen={drawer.isOpen} placement="right" size="lg" onClose={drawer.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            {selected && (
              <VStack align="start" spacing={1}>
                <StatusTag status={selected.overallStatus} />
                <Code fontSize="md" colorScheme="brand">{selected.serialNumber}</Code>
                <Text fontSize="sm" color="gray.500" fontWeight={400}>
                  {selected.model} · {selected.engineerName} · {fmtTs(selected.testedAt)}
                </Text>
              </VStack>
            )}
          </DrawerHeader>
          <DrawerBody py={5}>
            {!detail ? <Flex justify="center" py={10}><Spinner /></Flex> : (
              <VStack align="stretch" spacing={5}>
                <Box>
                  <Heading size="xs" mb={2} textTransform="uppercase" color="gray.500">Device</Heading>
                  <SimpleGrid columns={2} spacingY={1} fontSize="sm">
                    {[
                      ['MAC', detail.macAddress], ['WiFi MAC', detail.wirelessMacAddress],
                      ['IP', detail.ipAddress], ['UUID', detail.uuid],
                      ['Selected model', detail.selectedModel], ['Model match', String(detail.modelMatch)],
                      ['Firmware', detail.firmwareVersion], ['FW match', String(detail.firmwareMatch)],
                      ['Test type', detail.testType], ['Session', detail.sessionId],
                    ].map(([k, v]) => (
                      <React.Fragment key={k}>
                        <Text color="gray.500">{k}</Text>
                        <Text fontFamily="mono" fontSize="xs">{v ?? '—'}</Text>
                      </React.Fragment>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box>
                  <Heading size="xs" mb={2} textTransform="uppercase" color="gray.500">Test results</Heading>
                  <ResultGrid obj={detail.testResults} />
                </Box>

                {detail.liveCheck?.checks && (
                  <Box>
                    <Heading size="xs" mb={2} textTransform="uppercase" color="gray.500">Live checks</Heading>
                    <VStack align="stretch" spacing={1}>
                      {Object.entries(detail.liveCheck.checks).map(([name, c]) => (
                        <HStack key={name} justify="space-between" px={2} py={1} bg="gray.50" borderRadius="md">
                          <Text fontSize="xs">{name}</Text>
                          <Tag size="sm" colorScheme={c.status === 'pass' ? 'green' : 'red'} variant="subtle">{c.status}</Tag>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {detail.settingsApply?.verdict && (
                  <Box>
                    <Heading size="xs" mb={2} textTransform="uppercase" color="gray.500">Settings apply</Heading>
                    <Tag colorScheme={detail.settingsApply.verdict === 'Pass' ? 'green' : 'red'} variant="subtle">{detail.settingsApply.verdict}</Tag>
                  </Box>
                )}

                {detail.emsProvision && (
                  <Box>
                    <Heading size="xs" mb={2} textTransform="uppercase" color="gray.500">EMS provisioning</Heading>
                    <Code as="pre" display="block" whiteSpace="pre-wrap" fontSize="2xs" p={2} borderRadius="md" w="100%">
                      {JSON.stringify(detail.emsProvision, null, 2)}
                    </Code>
                  </Box>
                )}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
