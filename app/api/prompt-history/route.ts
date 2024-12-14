import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { imageUrl, initialPrompt, additionalPrompt, backendPrompt } = await req.json();

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const history = await prisma.PromptHistory.create({
      data: {
        userId: user.id,
        imageUrl,
        initialPrompt,
        additionalPrompt,
        backendPrompt,
      }
    });

    return Response.json(history);
  } catch (error) {
    console.error("Error creating prompt history:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const history = await prisma.promptHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json(history);
  } catch (error) {
    console.error("Error fetching prompt history:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing history item ID", { status: 400 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Verify ownership and delete
    const historyItem = await prisma.promptHistory.findUnique({
      where: { id }
    });

    if (!historyItem) {
      return new Response("History item not found", { status: 404 });
    }

    if (historyItem.userId !== user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await prisma.promptHistory.delete({
      where: { id }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting prompt history:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
