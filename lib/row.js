'use strict'

const Fragment = require('./fragment')
const util = require('./util')
const ops = require('./ops')

module.exports = class Row {
  constructor(doc, parent) {
    Fragment.prototype._init.call(this, doc, parent)

    this._pending = []
    this._rotated = 0
    this._y = 0
    this._startX = 0
    this._endY = null
    // TODO: do not hardcode widths
    this._widths = [200, 200, 200, 200]
    this._columns = 0
  }

  async _pageBreak(level) {
    this._pending.splice(this._pending.length - 2, 0 , this._pending.shift())

    // -1 because of row._end
    // -1 because we want a page break ont he last column
    // = -2
    if (this._rotated < this._pending.length - 2) {
      this._rotated++

      this.nextColumn()

      return false
    } else {
      this._rotated = 0
      const ok = await this._parent._pageBreak(level + 1)

      this._y = this._cursor.y
      this._cursor.startX = this._startX

      return ok
    }
  }

  nextColumn() {
    // this._cursor.startX += 200
    // this._cursor.x = this._cursor.startX
    this._cursor.y = this._y
  }

  async _end() {
    // reset cursor
    this._cursor.startX = this._cursor.x = this._startX
    this._cursor.y = this._endY
  }

  end() {
    return Fragment.prototype.end.call(this)
  }

  async _start(text, opts) {
    if (!this._doc._currentPage) {
      await this._doc._startPage()
    }

    this._pending.forEach(p => {
      if (Array.isArray(p)) {
        p.push(() => {
          if (this._endY === null || this._cursor.y < this._endY) {
            this._endY = this._cursor.y
          }
          this.nextColumn()
          return Promise.resolve()
        })
      }
    })

    this._y = this._cursor.y
    this._startX = this._cursor.startX
  }

  startCell(text, opts) {
    if (text !== null && typeof text === 'object') {
      opts = text
      text = ''
    }
    if (!opts || typeof opts !== 'object') {
      opts = {}
    }

    const Cell = require('./cell')

    const column = this._columns++
    const ctx = new Cell(this._doc, this, Object.assign({}, opts, {
      width: this._widths[column]
    }))

    ctx._cursor.startX += this._widths[column - 1] || 0
    ctx._cursor.x = ctx._cursor.startX
    ctx._pending.push(() => ctx._start())

    this._pending.push(ctx._pending)

    return ctx
  }
}