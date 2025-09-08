import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { authApi, findApi } from "@/lib/api";

const TWO_MINUTES = 120; // seconds

type Method = "email" | "phone";

const FindPassword = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: loginId 확인
  const [loginId, setLoginId] = useState("");

  // Step 2: 본인 인증 및 인증코드 검증
  const [method, setMethod] = useState<Method>("email");
  const [value, setValue] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = "비밀번호 찾기 | 그린드래곤";
    const meta = document.querySelector('meta[name="description"]');
    const content = "이메일 또는 휴대폰 인증으로 임시 비밀번호를 발급받으세요.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/find/password`);
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
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
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

  const handleCheckLoginId = async () => {
    const id = loginId.trim();
    if (!id) {
      toast({ title: "오류", description: "아이디를 입력해주세요.", variant: "destructive" });
      return;
    }
    // 회원가입과 동일한 중복체크 API 사용
    try {
      const resp = await authApi.checkId(id);
      if (!resp.ok) throw new Error("서버 오류");
      const data = await resp.json();
      // available === true -> 미사용(존재하지 않음), false -> 이미 사용중(존재)
      if (data.available) {
        toast({ title: "존재하지 않는 아이디", description: "입력하신 아이디를 찾을 수 없습니다.", variant: "destructive" });
        return;
      }
      // 존재하는 아이디이므로 다음 단계로 진행
      setStep(2);
      toast({ title: "확인 완료", description: "본인 인증 방법을 선택해주세요." });
    } catch (e) {
      toast({ title: "오류", description: "아이디 확인 중 문제가 발생했습니다.", variant: "destructive" });
    }
  };

  const handleSendCert = async () => {
    if (!value.trim()) {
      toast({ title: "오류", description: method === "email" ? "이메일을 입력해주세요." : "휴대폰 번호를 입력해주세요.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const resp = await findApi.passwordCert({ method, value, loginId: loginId.trim() });
      const json = await resp.json().catch(() => ({}));
      // 서버 메세지 우선 표시
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

  const handleVerifyAndReset = async () => {
    if (!verifyCode.trim()) {
      toast({ title: "오류", description: "인증번호를 입력해주세요.", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      const resp = await findApi.passwordReset({ verifyCode: verifyCode.trim(), value: value.trim(), method });
      const json = await resp.json().catch(() => ({}));
      if (json?.message) {
        toast({ description: json.message, variant: resp.ok ? "default" : "destructive" });
      } else if (!resp.ok) {
        toast({ title: "실패", description: "인증에 실패했습니다.", variant: "destructive" });
      } else {
        toast({ title: "완료", description: "임시 비밀번호가 발급되었습니다." });
      }
      if (resp.ok) {
        // 성공 시 로그인 페이지로 이동 유도
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
            <h1 className="text-3xl font-bold text-foreground">비밀번호 찾기</h1>
            <p className="text-muted-foreground mt-2">아이디 확인 후, 이메일 또는 휴대폰 인증으로 임시 비밀번호를 발급받습니다.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{step === 1 ? "1. 아이디 확인" : "2. 본인 인증 및 임시 비밀번호 발급"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-3">
                  <Label htmlFor="loginId">로그인 아이디</Label>
                  <Input id="loginId" placeholder="가입하신 아이디" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                  <div className="flex justify-end">
                    <Button onClick={handleCheckLoginId}>다음</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
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
                      {sent && (
                        <div className="text-sm text-muted-foreground self-center">유효시간 {formattedTime}</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="verify">인증번호</Label>
                    <Input id="verify" placeholder="5자리 인증번호" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
                    <div className="flex justify-end">
                      <Button onClick={handleVerifyAndReset} disabled={!sent || verifying}>
                        {verifying ? "처리 중..." : "인증 및 임시 비밀번호 발급"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindPassword;
