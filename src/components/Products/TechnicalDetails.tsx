import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Wrench, AlertCircle, Lightbulb } from 'lucide-react';

interface InstallationStep {
  step: number;
  title: string;
  description: string;
  warning?: string;
}

interface MaintenanceItem {
  item: string;
  frequency: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface TechnicalDetailsProps {
  technology: {
    title: string;
    description: string;
    advantages: string[];
  };
  installation: {
    time: string;
    difficulty: string;
    tools: string[];
    steps: InstallationStep[];
  };
  maintenance: MaintenanceItem[];
  troubleshooting: {
    issue: string;
    solution: string;
  }[];
}

const TechnicalDetails = ({
  technology,
  installation,
  maintenance,
  troubleshooting
}: TechnicalDetailsProps) => {
  return (
    <Tabs defaultValue="technology" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="technology">필터 기술</TabsTrigger>
        <TabsTrigger value="installation">설치 가이드</TabsTrigger>
        <TabsTrigger value="maintenance">유지보수</TabsTrigger>
        <TabsTrigger value="troubleshooting">문제해결</TabsTrigger>
      </TabsList>

      <TabsContent value="technology">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              {technology.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {technology.description}
            </p>
            
            <div>
              <h4 className="font-semibold mb-3">주요 장점</h4>
              <ul className="space-y-2">
                {technology.advantages.map((advantage, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{advantage}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="installation">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              설치 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary rounded-lg">
              <div className="text-center">
                <div className="font-semibold">설치 시간</div>
                <div className="text-sm text-muted-foreground">{installation.time}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">난이도</div>
                <Badge variant="outline">{installation.difficulty}</Badge>
              </div>
              <div className="text-center">
                <div className="font-semibold">필요 도구</div>
                <div className="text-sm text-muted-foreground">{installation.tools.join(', ')}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">설치 단계</h4>
              <div className="space-y-4">
                {installation.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium mb-1">{step.title}</h5>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                      {step.warning && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-800">{step.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="maintenance">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              유지보수 가이드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenance.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h5 className="font-medium">{item.item}</h5>
                      <Badge 
                        variant={
                          item.difficulty === 'Easy' ? 'default' : 
                          item.difficulty === 'Medium' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {item.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary">{item.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="troubleshooting">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              문제해결 가이드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {troubleshooting.map((item, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <h5 className="font-medium mb-2 text-destructive">문제: {item.issue}</h5>
                  <p className="text-sm text-muted-foreground">해결방법: {item.solution}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TechnicalDetails;