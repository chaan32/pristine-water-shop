import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { findApi } from "@/lib/api";

type Method = "email" | "phone";
const TWO_MINUTES = 120;

const FindLoginId = () => {
  const { toast } = useToast();
  const [method, setMethod] = useState<Method>("email");
  const [value, setValue] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = "아이디 찾기 | Dragon Water";
    const meta = document.querySelector('meta[name="description"]');
    const content = "이메일 또는 휴대폰 인증으로 가입 아이디를 확인하세요.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/find/loginId`);
    if (!canonical.parentElement) document.head.appendChild(canonical);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = window.setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [secondsLeft]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  const handleSendCert = async () => {
    if (!value.trim()) {
      toast({ title: "오류", description: method === "email" ? "이메일을 입력해주세요." : "휴대폰 번호를 입력해주세요.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const resp = await findApi.loginIdCert({ method, value });
      const json = await resp.json().catch(() => ({}));
      if (json?.message) {
        toast({ description: json.message, variant: resp.ok ? "default" : "destructive" });
      } else if (!resp.ok) {
        toast({ title: "오류", description: "인증번호 발송에 실패했습니다.", variant: "destructive" });
      } else {
        toast({ title: "발송 완료", description: "인증번호가 발송되었습니다. 2분 안에 입력해주세요." });
      }
      if (resp.ok) {
        setSent(true);
        setSecondsLeft(TWO_MINUTES);
      }
    } catch (e) {
      toast({ title: "오류", description: "인증번호 발송 중 문제가 발생했습니다.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyAndSend = async () => {
    if (!verifyCode.trim()) {
      toast({ title: "오류", description: "인증번호를 입력해주세요.", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      const resp = await findApi.loginIdSend({ verifyCode: verifyCode.trim(), value: value.trim(), method });
      const json = await resp.json().catch(() => ({}));
      if (json?.message) {
        toast({ description: json.message, variant: resp.ok ? "default" : "destructive" });
      } else if (!resp.ok) {
        toast({ title: "실패", description: "인증에 실패했습니다.", variant: "destructive" });
      } else {
        toast({ title: "완료", description: "로그인 아이디를 가입 이메일로 발송했습니다." });
      }
      if (resp.ok) {
        // 완료 후 로그인 페이지로 이동 유도
        setTimeout(() => {
          window.location.href = "/login";
        }, 800);
      }
    } catch (e) {
      toast({ title: "오류", description: "인증 처리 중 문제가 발생했습니다.", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">아이디 찾기</h1>
            <p className="text-muted-foreground mt-2">이메일 또는 휴대폰 인증으로 가입 아이디를 확인합니다.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>본인 인증</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>인증 방법 선택</Label>
                <RadioGroup value={method} onValueChange={(v) => setMethod(v as Method)} className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="email" value="email" />
                    <Label htmlFor="email">이메일</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="phone" value="phone" />
                    <Label htmlFor="phone">휴대폰</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="value">{method === "email" ? "이메일" : "휴대폰 번호"}</Label>
                <Input id="value" placeholder={method === "email" ? "example@domain.com" : "01012345678"} value={value} onChange={(e) => setValue(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleSendCert} disabled={sending}>
                    {sending ? "발송 중..." : sent ? "재발송" : "인증번호 발송"}
                  </Button>
                  {sent && <div className="text-sm text-muted-foreground self-center">유효시간 {formattedTime}</div>}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="verify">인증번호</Label>
                <Input id="verify" placeholder="5자리 인증번호" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
                <div className="flex justify-end">
                  <Button onClick={handleVerifyAndSend} disabled={!sent || verifying}>
                    {verifying ? "처리 중..." : "인증 및 아이디 발송"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindLoginId;
