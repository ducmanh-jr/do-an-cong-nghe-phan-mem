import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, insertMaterialSchema, insertSupplierSchema, insertInventorySchema } from "@shared/index";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Users / Auth ===
  app.post(api.users.login.path, async (req, res) => {
    const { username, password, role } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }
    
    // Check role if needed, simplified for now
    res.json(user);
  });

  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  // === Materials ===
  app.get(api.materials.list.path, async (req, res) => {
    const materials = await storage.getMaterials();
    res.json(materials);
  });

  app.post(api.materials.create.path, async (req, res) => {
    try {
      const input = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(input);
      res.status(201).json(material);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put(api.materials.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertMaterialSchema.partial().parse(req.body);
      const updated = await storage.updateMaterial(id, updates);
      if (!updated) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }
  });

  app.delete(api.materials.delete.path, async (req, res) => {
    await storage.deleteMaterial(parseInt(req.params.id));
    res.status(204).send();
  });

  // === Suppliers ===
  app.get(api.suppliers.list.path, async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post(api.suppliers.create.path, async (req, res) => {
    const input = insertSupplierSchema.parse(req.body);
    const supplier = await storage.createSupplier(input);
    res.status(201).json(supplier);
  });

  // === Inventory ===
  app.get(api.inventory.list.path, async (req, res) => {
    const inventory = await storage.getInventory();
    res.json(inventory);
  });

  app.post(api.inventory.create.path, async (req, res) => {
    const input = insertInventorySchema.parse(req.body);
    const item = await storage.createInventoryItem(input);
    res.status(201).json(item);
  });

  // === Invoices ===
  app.get(api.invoices.list.path, async (req, res) => {
    const invoices = await storage.getInvoices();
    res.json(invoices);
  });

  app.get(api.invoices.get.path, async (req, res) => {
    const invoice = await storage.getInvoice(parseInt(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    const { items, ...invoiceData } = req.body;
    // Basic validation
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Items required" });
    }
    
    const invoice = await storage.createInvoice(invoiceData, items);
    res.status(201).json(invoice);
  });

  // === Dashboard ===
  app.get(api.dashboard.get.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // === Messages ===
  app.get("/api/messages", async (req, res) => {
    const msgs = await storage.getMessages();
    res.json(msgs);
  });

  app.post("/api/messages", async (req, res) => {
    const input = req.body;
    const msg = await storage.createMessage(input);
    res.status(201).json(msg);
  });

  app.patch("/api/messages/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const updated = await storage.updateMessageStatus(id, status);
    res.json(updated);
  });

  // === Employees ===
  app.get("/api/employees", async (req, res) => {
    const emps = await storage.getEmployees();
    res.json(emps);
  });

  app.post("/api/employees", async (req, res) => {
    const input = req.body;
    const emp = await storage.createEmployee(input);
    res.status(201).json(emp);
  });

  // Seed Data if Empty
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const usersList = await storage.getUsers();
  if (usersList.length === 0) {
    console.log("Seeding database...");
    
    // Users
    await storage.createUser({ username: "manh", password: "000000", fullName: "Nguyễn Văn Mạnh", role: "admin", email: "manh@example.com" });
    await storage.createUser({ username: "tri", password: "000000", fullName: "Trí", role: "employee", email: "tri@example.com" });
    await storage.createUser({ username: "nam", password: "000000", fullName: "Nam", role: "employee", email: "nam@example.com" });
    await storage.createUser({ username: "tien", password: "000000", fullName: "Tiến", role: "employee", email: "tien@example.com" });
    await storage.createUser({ username: "kiet", password: "000000", fullName: "Kiệt", role: "employee", email: "kiet@example.com" });

    // Materials
    const m1 = await storage.createMaterial({ name: "Sữa hạt điều", type: "Sữa hạt", unit: "ml", minStock: 500, currentStock: 1000, description: "Sữa hạt điều nguyên chất" });
    const m2 = await storage.createMaterial({ name: "Sữa hạnh nhân", type: "Sữa hạt", unit: "ml", minStock: 300, currentStock: 500, description: "Sữa hạnh nhân không đường" });
    const m3 = await storage.createMaterial({ name: "Sữa óc chó", type: "Sữa hạt", unit: "ml", minStock: 200, currentStock: 300, description: "Sữa óc chó thơm ngon" });
    await storage.createMaterial({ name: "Sữa hạt dẻ cười", type: "Sữa hạt", unit: "ml", minStock: 250, currentStock: 400, description: "Sữa hạt dẻ cười đặc biệt" });
    await storage.createMaterial({ name: "Sữa đậu nành", type: "Sữa hạt", unit: "ml", minStock: 1000, currentStock: 2000, description: "Sữa đậu nành hữu cơ" });
    await storage.createMaterial({ name: "Sữa yến mạch", type: "Sữa hạt", unit: "ml", minStock: 800, currentStock: 1500, description: "Sữa yến mạch dinh dưỡng" });

    // Suppliers
    const s1 = await storage.createSupplier({ name: "Công ty TNHH Hạt Việt", phone: "0901234567", email: "hatviet@email.com", address: "Bình Phước", contact: "Nguyễn Văn A" });
    const s2 = await storage.createSupplier({ name: "HTX Nông sản Xanh", phone: "0912345678", email: "nongsan@email.com", address: "Đồng Nai", contact: "Trần Thị B" });
    
    // Inventory
    await storage.createInventoryItem({ materialId: m1.id, supplierId: s1.id, quantity: 1000, price: 150000, date: new Date(), status: 'fresh', batchCode: 'HD-001' });
    await storage.createInventoryItem({ materialId: m2.id, supplierId: s2.id, quantity: 500, price: 280000, date: new Date(), status: 'fresh', batchCode: 'HN-001' });

    // Messages
    await storage.createMessage({
      fromName: "Công ty Sữa Hạt Việt",
      content: "Tôi là nhà cung cấp, tôi có 200 ml sữa hạt điều bạn có muốn mua không?",
      type: "supplier_offer",
      metadata: { materialId: m1.id, quantity: 200, price: 150000 },
      status: "unread"
    });

    await storage.createMessage({
      fromName: "Đại lý Sữa Xanh",
      content: "Tôi là khách hàng tôi muốn mua 100 lốc sữa chuối (sữa hạt điều), kho còn hàng không?",
      type: "customer_request",
      metadata: { materialId: m1.id, quantity: 100, price: 200000 },
      status: "unread"
    });

    // Employees
    const u1 = (await storage.getUsers()).find(u => u.username === 'manh');
    const u2 = (await storage.getUsers()).find(u => u.username === 'tri');
    if (u1) await storage.createEmployee({ userId: u1.id, salary: 20000000, shift: "Hành chính", performance: "100%" });
    if (u2) await storage.createEmployee({ userId: u2.id, salary: 10000000, shift: "Sáng (8h-12h)", performance: "95%" });

    // Invoices (Seeding for Dashboard Stats)
    const inv1 = await storage.createInvoice({ type: 'IMPORT', partnerName: s1.name, total: 15000000, status: 'completed', invoiceNumber: 'IMP-001', date: new Date('2024-01-15') }, []);
    await storage.createInvoice({ type: 'EXPORT', partnerName: "Khách lẻ", total: 500000, status: 'completed', invoiceNumber: 'EXP-001', date: new Date('2024-01-20') }, []);
    await storage.createInvoice({ type: 'EXPORT', partnerName: "Đại lý A", total: 12000000, status: 'completed', invoiceNumber: 'EXP-002', date: new Date('2024-02-10') }, []);
    await storage.createInvoice({ type: 'IMPORT', partnerName: s2.name, total: 8000000, status: 'completed', invoiceNumber: 'IMP-002', date: new Date('2024-02-15') }, []);
    await storage.createInvoice({ type: 'EXPORT', partnerName: "Siêu thị B", total: 25000000, status: 'completed', invoiceNumber: 'EXP-003', date: new Date('2024-03-05') }, []);
    // Additional Seed Data for richer history
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Generate data for current and previous months
    await storage.createInvoice({ type: 'IMPORT', partnerName: "Nhập khẩu Á Châu", total: 45000000, status: 'completed', invoiceNumber: 'IMP-003', date: new Date(currentYear, currentMonth, 5) }, []);
    await storage.createInvoice({ type: 'EXPORT', partnerName: "Chuỗi Cà phê Highland", total: 18000000, status: 'completed', invoiceNumber: 'EXP-004', date: new Date(currentYear, currentMonth, 8) }, []);
    await storage.createInvoice({ type: 'EXPORT', partnerName: "The Coffee House", total: 22000000, status: 'completed', invoiceNumber: 'EXP-005', date: new Date(currentYear, currentMonth, 12) }, []);
    
    await storage.createInvoice({ type: 'IMPORT', partnerName: s1.name, total: 32000000, status: 'completed', invoiceNumber: 'IMP-004', date: new Date(currentYear, currentMonth - 1, 15) }, []);
    await storage.createInvoice({ type: 'EXPORT', partnerName: "Đại lý Cần Thơ", total: 15000000, status: 'completed', invoiceNumber: 'EXP-006', date: new Date(currentYear, currentMonth - 1, 20) }, []);

    // More Inventory History
    await storage.createInventoryItem({ materialId: m1.id, supplierId: s1.id, quantity: 200, price: 155000, date: new Date(currentYear, currentMonth, 2), status: 'fresh', batchCode: 'HD-002' });
    await storage.createInventoryItem({ materialId: m2.id, supplierId: s2.id, quantity: 300, price: 285000, date: new Date(currentYear, currentMonth, 4), status: 'fresh', batchCode: 'HN-002' });
    await storage.createInventoryItem({ materialId: m3.id, supplierId: s1.id, quantity: 150, price: 180000, date: new Date(currentYear, currentMonth - 1, 10), status: 'warning', batchCode: 'OC-001' });
    await storage.createInventoryItem({ materialId: m1.id, supplierId: s1.id, quantity: 500, price: 148000, date: new Date(currentYear, currentMonth - 2, 5), status: 'expired', batchCode: 'HD-OLD' });

    console.log("Database seeded!");
  }
}
