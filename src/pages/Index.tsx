import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'raw' | 'semifinished' | 'finished';
}

interface TechCard {
  id: string;
  name: string;
  output: string;
  ingredients: { itemId: string; quantity: number }[];
}

interface Transaction {
  id: string;
  type: 'receipt' | 'production' | 'shipment';
  date: string;
  item: string;
  quantity: number;
}

const Index = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Мука пшеничная', quantity: 500, unit: 'кг', category: 'raw' },
    { id: '2', name: 'Сахар', quantity: 200, unit: 'кг', category: 'raw' },
    { id: '3', name: 'Яйца', quantity: 1500, unit: 'шт', category: 'raw' },
    { id: '4', name: 'Масло сливочное', quantity: 150, unit: 'кг', category: 'raw' },
    { id: '5', name: 'Тесто песочное', quantity: 80, unit: 'кг', category: 'semifinished' },
    { id: '6', name: 'Крем заварной', quantity: 45, unit: 'кг', category: 'semifinished' },
    { id: '7', name: 'Печенье "Юбилейное"', quantity: 120, unit: 'уп', category: 'finished' },
    { id: '8', name: 'Торт "Наполеон"', quantity: 35, unit: 'шт', category: 'finished' },
  ]);

  const [techCards] = useState<TechCard[]>([
    {
      id: 't1',
      name: 'Тесто песочное',
      output: '10 кг',
      ingredients: [
        { itemId: '1', quantity: 5 },
        { itemId: '2', quantity: 2 },
        { itemId: '3', quantity: 10 },
        { itemId: '4', quantity: 3 },
      ],
    },
    {
      id: 't2',
      name: 'Печенье "Юбилейное"',
      output: '50 упаковок',
      ingredients: [{ itemId: '5', quantity: 15 }],
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'tr1', type: 'receipt', date: '2025-10-23', item: 'Мука пшеничная', quantity: 100 },
    { id: 'tr2', type: 'production', date: '2025-10-24', item: 'Тесто песочное', quantity: 30 },
    { id: 'tr3', type: 'shipment', date: '2025-10-25', item: 'Печенье "Юбилейное"', quantity: 50 },
  ]);

  const chartData = [
    { date: '20.10', raw: 450, semi: 60, finished: 80 },
    { date: '21.10', raw: 480, semi: 70, finished: 95 },
    { date: '22.10', raw: 470, semi: 65, finished: 110 },
    { date: '23.10', raw: 500, semi: 75, finished: 100 },
    { date: '24.10', raw: 520, semi: 80, finished: 120 },
    { date: '25.10', raw: 500, semi: 85, finished: 155 },
  ];

  const categoryData = [
    { name: 'Сырье', value: 850, color: '#0EA5E9' },
    { name: 'Полуфабрикаты', value: 125, color: '#8B5CF6' },
    { name: 'Продукция', value: 155, color: '#F97316' },
  ];

  const handleReceipt = (data: any) => {
    const item = inventory.find(i => i.id === data.itemId);
    if (item) {
      setInventory(prev =>
        prev.map(i =>
          i.id === data.itemId ? { ...i, quantity: i.quantity + parseInt(data.quantity) } : i
        )
      );
      setTransactions(prev => [
        {
          id: `tr${Date.now()}`,
          type: 'receipt',
          date: new Date().toISOString().split('T')[0],
          item: item.name,
          quantity: parseInt(data.quantity),
        },
        ...prev,
      ]);
      toast.success('Приход оформлен');
    }
  };

  const handleProduction = (techCardId: string, batches: number) => {
    const card = techCards.find(tc => tc.id === techCardId);
    if (!card) return;

    let canProduce = true;
    card.ingredients.forEach(ing => {
      const item = inventory.find(i => i.id === ing.itemId);
      if (!item || item.quantity < ing.quantity * batches) {
        canProduce = false;
      }
    });

    if (!canProduce) {
      toast.error('Недостаточно сырья для производства');
      return;
    }

    setInventory(prev =>
      prev.map(item => {
        const ingredient = card.ingredients.find(ing => ing.itemId === item.id);
        if (ingredient) {
          return { ...item, quantity: item.quantity - ingredient.quantity * batches };
        }
        const outputItem = prev.find(i => i.name === card.name);
        if (outputItem && item.id === outputItem.id) {
          return { ...item, quantity: item.quantity + batches * 10 };
        }
        return item;
      })
    );

    toast.success('Производство завершено');
  };

  const rawMaterials = inventory.filter(i => i.category === 'raw');
  const semiFinished = inventory.filter(i => i.category === 'semifinished');
  const finished = inventory.filter(i => i.category === 'finished');

  const totalValue = {
    raw: rawMaterials.reduce((sum, item) => sum + item.quantity, 0),
    semi: semiFinished.reduce((sum, item) => sum + item.quantity, 0),
    finished: finished.reduce((sum, item) => sum + item.quantity, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Icon name="Package" className="text-sidebar-primary-foreground" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold">WMS Pro</h1>
                <p className="text-xs text-sidebar-foreground/60">Складской учет</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon name="LayoutDashboard" size={20} />
              <span>Дашборд</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon name="TrendingDown" size={20} />
              <span>Приход</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon name="Factory" size={20} />
              <span>Производство</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon name="TrendingUp" size={20} />
              <span>Отгрузки</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon name="FileText" size={20} />
              <span>Тех. карты</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon name="BarChart3" size={20} />
              <span>Аналитика</span>
            </Button>
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon name="Settings" size={20} />
              <span>Настройки</span>
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Складской учет</h2>
              <p className="text-muted-foreground">Управление запасами и производством</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-l-4 border-l-primary hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Сырье</CardTitle>
                  <Icon name="Wheat" className="text-primary" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalValue.raw}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rawMaterials.length} позиций на складе
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#8B5CF6] hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Полуфабрикаты</CardTitle>
                  <Icon name="Layers" className="text-[#8B5CF6]" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalValue.semi}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {semiFinished.length} позиций в обработке
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#F97316] hover-scale">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Готовая продукция</CardTitle>
                  <Icon name="PackageCheck" className="text-[#F97316]" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalValue.finished}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {finished.length} позиций готовы к отгрузке
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Динамика запасов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="raw"
                        stackId="1"
                        stroke="#0EA5E9"
                        fill="#0EA5E9"
                        fillOpacity={0.6}
                        name="Сырье"
                      />
                      <Area
                        type="monotone"
                        dataKey="semi"
                        stackId="1"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.6}
                        name="Полуфабрикаты"
                      />
                      <Area
                        type="monotone"
                        dataKey="finished"
                        stackId="1"
                        stroke="#F97316"
                        fill="#F97316"
                        fillOpacity={0.6}
                        name="Продукция"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" size={20} />
                    Структура запасов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {categoryData.map((entry, index) => (
                          <Bar key={index} dataKey="value" fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="operations" className="space-y-6">
              <TabsList className="grid w-full max-w-2xl grid-cols-4">
                <TabsTrigger value="operations">Операции</TabsTrigger>
                <TabsTrigger value="inventory">Остатки</TabsTrigger>
                <TabsTrigger value="techcards">Тех. карты</TabsTrigger>
                <TabsTrigger value="history">История</TabsTrigger>
              </TabsList>

              <TabsContent value="operations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover-scale border-2 hover:border-primary transition-colors">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <Icon name="TrendingDown" className="text-primary" size={24} />
                          </div>
                          <h3 className="font-semibold mb-1">Приход сырья</h3>
                          <p className="text-sm text-muted-foreground">Оформить поступление</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Приход сырья</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleReceipt({
                            itemId: formData.get('item'),
                            quantity: formData.get('quantity'),
                          });
                          e.currentTarget.reset();
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="item">Товар</Label>
                          <Select name="item" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите товар" />
                            </SelectTrigger>
                            <SelectContent>
                              {rawMaterials.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="quantity">Количество</Label>
                          <Input id="quantity" name="quantity" type="number" required min="1" />
                        </div>
                        <Button type="submit" className="w-full">
                          Оформить приход
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover-scale border-2 hover:border-[#8B5CF6] transition-colors">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-3">
                            <Icon name="Factory" className="text-[#8B5CF6]" size={24} />
                          </div>
                          <h3 className="font-semibold mb-1">Производство</h3>
                          <p className="text-sm text-muted-foreground">Выпуск по тех. карте</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Производство</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleProduction(formData.get('techcard') as string, parseInt(formData.get('batches') as string));
                          e.currentTarget.reset();
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="techcard">Технологическая карта</Label>
                          <Select name="techcard" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тех. карту" />
                            </SelectTrigger>
                            <SelectContent>
                              {techCards.map(card => (
                                <SelectItem key={card.id} value={card.id}>
                                  {card.name} ({card.output})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="batches">Количество партий</Label>
                          <Input id="batches" name="batches" type="number" required min="1" defaultValue="1" />
                        </div>
                        <Button type="submit" className="w-full">
                          Запустить производство
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover-scale border-2 hover:border-[#F97316] transition-colors">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-[#F97316]/10 flex items-center justify-center mx-auto mb-3">
                            <Icon name="TrendingUp" className="text-[#F97316]" size={24} />
                          </div>
                          <h3 className="font-semibold mb-1">Отгрузка</h3>
                          <p className="text-sm text-muted-foreground">На маркетплейс</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Отгрузка на маркетплейс</DialogTitle>
                      </DialogHeader>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="product">Продукция</Label>
                          <Select name="product" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите продукцию" />
                            </SelectTrigger>
                            <SelectContent>
                              {finished.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} (в наличии: {item.quantity} {item.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="marketplace">Маркетплейс</Label>
                          <Select name="marketplace" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите маркетплейс" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wb">Wildberries</SelectItem>
                              <SelectItem value="ozon">Ozon</SelectItem>
                              <SelectItem value="yandex">Яндекс.Маркет</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="shipment-quantity">Количество</Label>
                          <Input id="shipment-quantity" name="quantity" type="number" required min="1" />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          onClick={e => {
                            e.preventDefault();
                            toast.success('Отгрузка оформлена');
                          }}
                        >
                          Оформить отгрузку
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>

              <TabsContent value="inventory">
                <Card>
                  <CardHeader>
                    <CardTitle>Остатки на складе</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Категория</TableHead>
                          <TableHead className="text-right">Количество</TableHead>
                          <TableHead className="text-right">Единица</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.category === 'raw'
                                    ? 'default'
                                    : item.category === 'semifinished'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {item.category === 'raw'
                                  ? 'Сырье'
                                  : item.category === 'semifinished'
                                  ? 'Полуфабрикат'
                                  : 'Продукция'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{item.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="techcards">
                <div className="grid gap-4">
                  {techCards.map(card => (
                    <Card key={card.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Icon name="FileText" size={20} />
                            {card.name}
                          </span>
                          <Badge variant="outline">{card.output}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Состав:</h4>
                        <div className="space-y-2">
                          {card.ingredients.map(ing => {
                            const item = inventory.find(i => i.id === ing.itemId);
                            return (
                              <div
                                key={ing.itemId}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <span className="font-medium">{item?.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {ing.quantity} {item?.unit}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>История операций</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Дата</TableHead>
                          <TableHead>Операция</TableHead>
                          <TableHead>Товар</TableHead>
                          <TableHead className="text-right">Количество</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map(tr => (
                          <TableRow key={tr.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(tr.date).toLocaleDateString('ru-RU')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  tr.type === 'receipt'
                                    ? 'default'
                                    : tr.type === 'production'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {tr.type === 'receipt'
                                  ? 'Приход'
                                  : tr.type === 'production'
                                  ? 'Производство'
                                  : 'Отгрузка'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{tr.item}</TableCell>
                            <TableCell className="text-right font-semibold">{tr.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
