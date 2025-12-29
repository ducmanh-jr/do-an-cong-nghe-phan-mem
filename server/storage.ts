import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/index";
import { eq, desc } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

import {
  type User, type InsertUser,
  type Material, type InsertMaterial,
  type Supplier, type InsertSupplier,
  type InventoryItem, type InsertInventory,
  type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem,
  type InvoiceWithItems,
  type Employee, type InsertEmployee,
  type Message, type InsertMessage,
  users, materials, suppliers, inventory, invoices, invoiceItems, employees, messages
} from "@shared/index";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getMaterials(): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, updates: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(id: number): Promise<void>;
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  getInventory(): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventory): Promise<InventoryItem>;
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<InvoiceWithItems | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;
  getDashboardStats(): Promise<{
    totalMaterials: number; 
    totalValue: number; 
    lowStockCount: number;
    recentInvoices: Invoice[]
  }>;
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message>;
  getEmployees(): Promise<(Employee & { user: User })[]>;
  getEmployeeByUserId(userId: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials).orderBy(materials.id);
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material;
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [newMaterial] = await db.insert(materials).values(material).returning();
    return newMaterial;
  }

  async updateMaterial(id: number, updates: Partial<InsertMaterial>): Promise<Material> {
    const [updated] = await db.update(materials)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(materials.id, id))
      .returning();
    if (!updated) throw new Error("Material not found");
    return updated;
  }

  async deleteMaterial(id: number): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }

  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async getInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory);
  }

  async createInventoryItem(item: InsertInventory): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    
    if (item.materialId) {
       const material = await this.getMaterial(item.materialId);
       if (material) {
         await this.updateMaterial(item.materialId, {
           currentStock: (material.currentStock || 0) + item.quantity
         });
       }
    }

    return newItem;
  }

  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.date));
  }

  async getInvoice(id: number): Promise<InvoiceWithItems | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;

    const items = await db.select({
      id: invoiceItems.id,
      invoiceId: invoiceItems.invoiceId,
      materialId: invoiceItems.materialId,
      quantity: invoiceItems.quantity,
      price: invoiceItems.price,
      material: materials
    })
    .from(invoiceItems)
    .innerJoin(materials, eq(invoiceItems.materialId, materials.id))
    .where(eq(invoiceItems.invoiceId, id));

    return { ...invoice, items };
  }

  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    
    if (items.length > 0) {
      await db.insert(invoiceItems).values(
        items.map(item => ({ ...item, invoiceId: newInvoice.id }))
      );

      for (const item of items) {
        if (!item.materialId) continue;
        
        const material = await this.getMaterial(item.materialId);
        if (!material) continue;

        const change = invoice.type === 'IMPORT' ? item.quantity : -item.quantity;
        
        // Basic Inventory tracking update
        await this.updateMaterial(item.materialId, {
          currentStock: (material.currentStock || 0) + change
        });

        // Add to inventory table for tracking
        if (invoice.type === 'IMPORT') {
          await this.createInventoryItem({
            materialId: item.materialId,
            quantity: item.quantity,
            price: item.price,
            date: invoice.date || new Date(),
            status: 'fresh',
            batchCode: invoice.invoiceNumber || `BATCH-${Date.now()}`
          });
        }
      }
    }

    return newInvoice;
  }

  async getDashboardStats() {
    const allMaterials = await this.getMaterials();
    const allInventory = await this.getInventory();
    const allInvoices = await this.getInvoices();
    const recentInvoices = allInvoices.slice(0, 5);

    const totalValue = allInventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockCount = allMaterials.filter(m => (m.currentStock || 0) < (m.minStock || 0)).length;

    // Calculate total materials by material for the pie chart
    const totalMaterialsByMaterial = allMaterials.map(m => ({
      name: m.name,
      value: m.currentStock || 0
    }));

    // Financial calculations
    const revenue = allInvoices
      .filter(inv => inv.type === 'EXPORT')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const cost = allInvoices
      .filter(inv => inv.type === 'IMPORT')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Calculate Monthly Data (All 12 months)
    const monthlyDataMap = new Map<number, { revenue: number, cost: number }>();
    
    // Initialize all 12 months
    for (let i = 1; i <= 12; i++) {
      monthlyDataMap.set(i, { revenue: 0, cost: 0 });
    }

    // Populate with actual invoice data
    allInvoices.forEach(inv => {
      if (!inv.date) return;
      const invDate = new Date(inv.date);
      const monthNum = invDate.getMonth() + 1;
      
      if (monthlyDataMap.has(monthNum)) {
        const entry = monthlyDataMap.get(monthNum)!;
        if (inv.type === 'EXPORT') entry.revenue += (inv.total || 0);
        else entry.cost += (inv.total || 0);
      }
    });

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    
    const monthlyData = Array.from(monthlyDataMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([monthNum, data]) => ({
        month: monthNames[monthNum - 1],
        revenue: data.revenue,
        cost: data.cost
      }));

    // Simulated Weekly Data (derived from recent activity)
    const weeklyData = [
      { name: 'Tuần 1', revenue: revenue * 0.2, cost: cost * 0.15 },
      { name: 'Tuần 2', revenue: revenue * 0.25, cost: cost * 0.2 },
      { name: 'Tuần 3', revenue: revenue * 0.15, cost: cost * 0.3 },
      { name: 'Tuần 4', revenue: revenue * 0.3, cost: cost * 0.25 },
    ];

    return {
      totalMaterials: allMaterials.length,
      totalValue,
      lowStockCount,
      recentInvoices,
      totalMaterialsByMaterial,
      financialReport: {
        revenue,
        cost,
        profit: revenue - cost,
        inventoryValue: totalValue,
        monthlyData,
        weeklyData
      }
    };
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async updateMessageStatus(id: number, status: string): Promise<Message> {
    const [updated] = await db.update(messages).set({ status }).where(eq(messages.id, id)).returning();
    return updated;
  }

  async getEmployees(): Promise<(Employee & { user: User })[]> {
    const result = await db.select({
      employee: employees,
      user: users
    })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id));
    
    return result.map(r => ({ ...r.employee, user: r.user }));
  }

  async getEmployeeByUserId(userId: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.userId, userId));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }
}

export const storage = new DatabaseStorage();
