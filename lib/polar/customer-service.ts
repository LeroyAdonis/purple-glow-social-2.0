/**
 * Polar Customer Service
 * 
 * Handles Polar customer management
 */

import { polarClient } from './client';
import { db } from '../../drizzle/db';
import { user as userTable } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import type { User } from '../../drizzle/schema';

/**
 * Get or create a Polar customer for a user
 */
export async function getOrCreateCustomer(user: User): Promise<string> {
  // If user already has a Polar customer ID, return it
  if (user.polarCustomerId) {
    return user.polarCustomerId;
  }

  try {
    // Create a new Polar customer
    const customer = await polarClient.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });

    // Update user record with Polar customer ID
    await db
      .update(userTable)
      .set({ 
        polarCustomerId: customer.id,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, user.id));

    return customer.id;
  } catch (error) {
    console.error('Error creating Polar customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Update Polar customer details
 */
export async function updateCustomer(customerId: string, data: { email?: string; name?: string }) {
  try {
    return await polarClient.customers.update({
      id: customerId,
      customerUpdate: {
        email: data.email,
        name: data.name,
      },
    });
  } catch (error) {
    console.error('Error updating Polar customer:', error);
    throw new Error('Failed to update customer');
  }
}
