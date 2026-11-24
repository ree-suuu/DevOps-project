import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const token = req.cookies?.klay_token || bearerToken
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.userId).select('-password')
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Authentication required' })
  }
}
