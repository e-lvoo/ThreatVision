import { Alert, ThreatCategory } from '@/types/dashboard';

const threatTypes: { type: string; category: ThreatCategory }[] = [
  { type: 'SQL Injection', category: 'injection' },
  { type: 'DDoS Attack', category: 'ddos' },
  { type: 'Ransomware Detected', category: 'ransomware' },
  { type: 'Trojan Horse', category: 'trojan' },
  { type: 'Phishing Attempt', category: 'phishing' },
  { type: 'Brute Force', category: 'bruteforce' },
  { type: 'Worm Propagation', category: 'worm' },
  { type: 'Virus Signature', category: 'virus' },
];

const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'] as const;
const models = ['ThreatNet v3.2', 'AnomalyDetector v2.1', 'SignatureDB v5.0', 'BehaviorAnalysis v1.8'];
const methods = ['Signature-based', 'Behavior Analysis', 'Anomaly Detection', 'Heuristic Analysis', 'Machine Learning'];

const generateIp = () => 
  `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

const generatePort = () => Math.floor(Math.random() * 65535) + 1;

const severities = ['critical', 'high', 'medium', 'low'] as const;
const statuses = ['open', 'acknowledged', 'resolved'] as const;

export const generateAlerts = (count: number): Alert[] => {
  return Array.from({ length: count }, (_, i) => {
    const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    const alert: Alert = {
      id: `ALT-${String(i + 1).padStart(5, '0')}`,
      timestamp,
      sourceIp: generateIp(),
      sourcePort: generatePort(),
      destinationIp: generateIp(),
      destinationPort: generatePort(),
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      threatType: threat.type,
      threatCategory: threat.category,
      severity,
      status,
      description: `${threat.type} detected from source ${generateIp()}`,
      confidenceScore: Math.floor(Math.random() * 40) + 60,
      packetCount: Math.floor(Math.random() * 10000) + 100,
      byteCount: Math.floor(Math.random() * 5000000) + 10000,
      modelUsed: models[Math.floor(Math.random() * models.length)],
      detectionMethod: methods[Math.floor(Math.random() * methods.length)],
    };

    if (status === 'acknowledged' || status === 'resolved') {
      alert.acknowledgedAt = new Date(timestamp.getTime() + Math.random() * 30 * 60 * 1000);
    }
    if (status === 'resolved') {
      alert.resolvedAt = new Date(alert.acknowledgedAt!.getTime() + Math.random() * 60 * 60 * 1000);
    }

    if (Math.random() > 0.6) {
      alert.notes = [
        {
          id: `note-${i}-1`,
          content: 'Initial investigation started. Checking firewall logs.',
          author: 'John Analyst',
          timestamp: new Date(timestamp.getTime() + 5 * 60 * 1000),
        },
      ];
      if (Math.random() > 0.5) {
        alert.notes.push({
          id: `note-${i}-2`,
          content: 'Confirmed malicious activity. Source IP has been added to watch list.',
          author: 'Sarah Admin',
          timestamp: new Date(timestamp.getTime() + 15 * 60 * 1000),
        });
      }
    }

    return alert;
  });
};

export const mockAlertsData: Alert[] = generateAlerts(50);
