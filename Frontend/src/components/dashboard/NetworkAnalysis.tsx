import { useState } from "react";
import { useAnalysis } from "@/hooks/use-analysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Shield, Link as LinkIcon, Info, Cpu, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const NetworkAnalysis = () => {
    const [input, setInput] = useState("");
    const { mutate: analyze, isPending, data: result } = useAnalysis();

    const handleAnalyze = () => {
        if (!input.trim()) return;
        analyze(input);
    };

    const getExampleData = (type: 'benign' | 'malicious') => {
        if (type === 'benign') {
            setInput('GET /index.html HTTP/1.1\nHost: example.com\nUser-Agent: Mozilla/5.0');
        } else {
            setInput("SELECT * FROM users WHERE id = '1' OR '1'='1'\n-- Origin: unknown-proxy-88");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="glass-card border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle>Manual Traffic Analysis</CardTitle>
                    </div>
                    <CardDescription>
                        Submit raw network traffic strings to the DistilBERT model for real-time intrusion detection.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 mb-2">
                        <Button variant="outline" size="sm" onClick={() => getExampleData('benign')}>
                            Load Benign Example
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => getExampleData('malicious')}>
                            Load Malicious Example
                        </Button>
                    </div>

                    <Textarea
                        placeholder="Paste raw packet data or API logs here..."
                        className="min-h-[150px] font-mono bg-muted/30 border-primary/10 focus:border-primary/50"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />

                    <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handleAnalyze}
                        disabled={isPending || !input}
                    >
                        {isPending ? "Analyzing Traffic..." : "Analyze Now"}
                    </Button>

                    {result && (
                        <div className="mt-6 p-4 rounded-lg border border-border/50 bg-background/50 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Analysis Result</span>
                                <Badge
                                    variant={result.classification === "Malicious" ? "destructive" : "secondary"}
                                    className="px-3 py-1 font-bold"
                                >
                                    {result.classification}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 rounded bg-muted/20 border border-border/30">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <Info className="h-4 w-4" />
                                        Confidence
                                    </div>
                                    <div className="text-xl font-bold">{(result.confidence * 100).toFixed(2)}%</div>
                                </div>
                                <div className="p-3 rounded bg-muted/20 border border-border/30">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <Cpu className="h-4 w-4" />
                                        Model Used
                                    </div>
                                    <div className="text-sm font-mono truncate">{result.model_version.split('/').pop()}</div>
                                </div>
                            </div>

                            {result.alert_generated && (
                                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-3 text-destructive">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm">Security Alert Generated</h4>
                                        <p className="text-xs opacity-90">This transaction has been flagged and logged in the Alerts database.</p>
                                    </div>
                                    <Button variant="link" size="sm" className="ml-auto text-destructive p-0 h-auto underline" asChild>
                                        <Link to="/dashboard/alerts">View Alerts</Link>
                                    </Button>
                                </div>
                            )}

                            {result.classification === "Benign" && (
                                <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20 flex gap-3 text-success">
                                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm">Traffic Verified Safe</h4>
                                        <p className="text-xs opacity-90">No malicious patterns detected in the provided input.</p>
                                    </div>
                                    <Button variant="link" size="sm" className="ml-auto text-success p-0 h-auto underline" asChild>
                                        <Link to="/dashboard/history">View History</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-4 items-start">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Activity className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-medium">How it works</h4>
                    <p className="text-sm text-muted-foreground">
                        The background service processes your input through a DistilBERT sequence classifier.
                        It looks for signs of SQL injection, cross-site scripting (XSS), and common network reconnaissance patterns.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NetworkAnalysis;
